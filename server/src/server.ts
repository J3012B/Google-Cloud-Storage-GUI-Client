import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import multer from 'multer';
import { bucket } from './storage.js';
import { errorHandler } from './errorHandler.js';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const app = express();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// List files and directories under a prefix
app.get(
  '/api/list',
  errorHandler(async (req, res) => {
    const prefix = ((req.query.prefix as string) || '').replace(/^\/+/, '');

    const [files] = await bucket.getFiles({ prefix });

    const directories = new Set<string>();
    const fileItems: any[] = [];

    for (const file of files) {
      const relativePath = file.name.slice(prefix.length);
      if (!relativePath) continue; // skip the prefix object itself
      const parts = relativePath.split('/');
      if (parts.length > 1) {
        directories.add(prefix + parts[0] + '/');
      } else {
        fileItems.push({
          name: file.name,
          size: Number(file.metadata.size || 0),
          updated: file.metadata.updated,
          contentType: file.metadata.contentType,
        });
      }
    }

    res.json({ prefixes: Array.from(directories), files: fileItems });
  })
);

// Upload files directly through the server
app.post(
  '/api/upload',
  upload.single('file'),
  errorHandler(async (req, res) => {
    const file = req.file;
    const filePath = req.body.filePath;

    if (!file || !filePath) {
      return res.status(400).json({ error: 'File and filePath are required' });
    }

    console.log('Uploading file:', filePath, 'Size:', file.size, 'Content-Type:', file.mimetype);

    try {
      // Get signed URL for upload
      const [signedUrl] = await bucket.file(filePath).getSignedUrl({
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      console.log('Got signed URL, uploading to GCS...');

      // Upload file to GCS using the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file.buffer,
        headers: {
          'Content-Type': file.mimetype || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('GCS upload failed:', uploadResponse.status, uploadResponse.statusText, errorText);
        return res.status(500).json({ 
          error: 'Failed to upload to storage',
          details: `${uploadResponse.status} ${uploadResponse.statusText}` 
        });
      }

      console.log('Successfully uploaded to GCS:', filePath);
      res.json({ 
        success: true, 
        filePath,
        message: 'File uploaded successfully'
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

// Get a signed URL for a single file
app.get(
  '/api/signed-url',
  errorHandler(async (req, res) => {
    const filePath = (req.query.file as string) ?? '';
    if (!filePath) {
      return res.status(400).json({ error: 'file query parameter required' });
    }
    const [url] = await bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    res.json({ url });
  })
);

// Get a signed URL for uploading a file (write access)
app.get(
  '/api/signed-url-upload',
  errorHandler(async (req, res) => {
    const filePath = (req.query.file as string) ?? '';
    const contentType = (req.query.contentType as string) ?? 'application/octet-stream';
    
    if (!filePath) {
      return res.status(400).json({ error: 'file query parameter required' });
    }
    
    console.log('Generating signed URL for upload:', filePath, 'Content-Type:', contentType);
    
    const [url] = await bucket.file(filePath).getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    res.json({ url });
  })
);

// Basic health route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static frontend build if available
const clientBuild = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../client/dist');
app.use(express.static(clientBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
}); 