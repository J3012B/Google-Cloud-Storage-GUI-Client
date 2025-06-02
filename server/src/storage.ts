import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const bucketName = process.env.GCS_BUCKET_NAME;
const accessKey = process.env.GCS_ACCESS_KEY;
const secret = process.env.GCS_SECRET;

if (!bucketName) {
  throw new Error('GCS_BUCKET_NAME environment variable not provided');
}

if (!accessKey) {
  throw new Error('GCS_ACCESS_KEY environment variable not provided');
}

if (!secret) {
  throw new Error('GCS_SECRET environment variable not provided');
}

// GOOG4-HMAC-SHA256 implementation for Google Cloud Storage
function getSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Buffer {
  const key1 = crypto.createHmac('sha256', 'GOOG4' + secretKey).update(dateStamp).digest();
  const key2 = crypto.createHmac('sha256', key1).update(region).digest();
  const key3 = crypto.createHmac('sha256', key2).update(service).digest();
  const signingKey = crypto.createHmac('sha256', key3).update('goog4_request').digest();
  return signingKey;
}

function createCanonicalRequest(method: string, uri: string, queryString: string, headers: Record<string, string>, signedHeaders: string[], payload: string): string {
  const canonicalHeaders = signedHeaders
    .map(header => `${header.toLowerCase()}:${headers[header]?.trim() || ''}`)
    .join('\n') + '\n';
  
  const signedHeadersString = signedHeaders.map(h => h.toLowerCase()).join(';');
  
  const payloadHash = headers['x-goog-content-sha256'] === 'UNSIGNED-PAYLOAD' 
    ? 'UNSIGNED-PAYLOAD' 
    : crypto.createHash('sha256').update(payload).digest('hex');
  
  return [
    method,
    uri,
    queryString,
    canonicalHeaders,
    signedHeadersString,
    payloadHash
  ].join('\n');
}

function createStringToSign(algorithm: string, datetime: string, scope: string, canonicalRequestHash: string): string {
  return [
    algorithm,
    datetime,
    scope,
    canonicalRequestHash
  ].join('\n');
}

// Create a bucket interface that mimics the @google-cloud/storage library
export const bucket = {
  name: bucketName,
  
  async getFiles(options: { prefix?: string } = {}) {
    const prefix = options.prefix || '';
    const now = new Date();
    const datetime = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = datetime.substring(0, 8);
    
    const algorithm = 'GOOG4-HMAC-SHA256';
    const region = 'auto'; // Use 'auto' for global endpoint
    const service = 'storage';
    const credentialScope = `${date}/${region}/${service}/goog4_request`;
    
    const method = 'GET';
    const uri = '/';
    const queryString = prefix ? `prefix=${encodeURIComponent(prefix)}` : '';
    
    const host = `${bucketName}.storage.googleapis.com`;
    const headers = {
      'host': host,
      'x-goog-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-goog-date': datetime
    };
    
    const signedHeaders = ['host', 'x-goog-content-sha256', 'x-goog-date'];
    
    const canonicalRequest = createCanonicalRequest(method, uri, queryString, headers, signedHeaders, '');
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    const stringToSign = createStringToSign(algorithm, datetime, credentialScope, canonicalRequestHash);
    
    const signingKey = getSigningKey(secret, date, region, service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    
    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders.join(';')}, Signature=${signature}`;
    
    const url = `https://${host}${uri}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': authorizationHeader,
        'x-goog-content-sha256': 'UNSIGNED-PAYLOAD',
        'x-goog-date': datetime,
        'Host': host
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list files: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const xmlText = await response.text();
    
    // Parse XML response to extract file information
    const files = parseXMLListResponse(xmlText);
    
    return [files];
  },
  
  file(fileName: string) {
    return {
      async getSignedUrl(options: { action: string; expires: number }) {
        const now = new Date();
        const datetime = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
        const date = datetime.substring(0, 8);
        
        const algorithm = 'GOOG4-HMAC-SHA256';
        const region = 'auto';
        const service = 'storage';
        const credentialScope = `${date}/${region}/${service}/goog4_request`;
        
        const method = 'GET';
        const uri = `/${encodeURIComponent(fileName)}`;
        const host = `${bucketName}.storage.googleapis.com`;
        
        const queryParams = {
          'X-Goog-Algorithm': algorithm,
          'X-Goog-Credential': `${accessKey}/${credentialScope}`,
          'X-Goog-Date': datetime,
          'X-Goog-Expires': '900', // 15 minutes
          'X-Goog-SignedHeaders': 'host'
        };
        
        const queryString = Object.entries(queryParams)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
        
        const headers = { 'host': host };
        const signedHeaders = ['host'];
        
        const canonicalRequest = createCanonicalRequest(method, uri, queryString, headers, signedHeaders, '');
        const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
        
        const stringToSign = createStringToSign(algorithm, datetime, credentialScope, canonicalRequestHash);
        
        const signingKey = getSigningKey(secret, date, region, service);
        const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
        
        const signedUrl = `https://${host}${uri}?${queryString}&X-Goog-Signature=${signature}`;
        
        return [signedUrl];
      }
    };
  }
};

// Simple XML parser for list bucket response
function parseXMLListResponse(xmlText: string) {
  const files: any[] = [];
  
  // Extract contents (files) using regex - simple approach for this use case
  const contentRegex = /<Contents>(.*?)<\/Contents>/gs;
  let match;
  
  while ((match = contentRegex.exec(xmlText)) !== null) {
    const content = match[1];
    
    const keyMatch = content.match(/<Key>(.*?)<\/Key>/);
    const sizeMatch = content.match(/<Size>(.*?)<\/Size>/);
    const lastModifiedMatch = content.match(/<LastModified>(.*?)<\/LastModified>/);
    
    if (keyMatch) {
      files.push({
        name: keyMatch[1],
        metadata: {
          size: sizeMatch ? sizeMatch[1] : '0',
          updated: lastModifiedMatch ? lastModifiedMatch[1] : new Date().toISOString(),
          contentType: 'application/octet-stream', // Default content type
        }
      });
    }
  }
  
  return files;
} 