import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { bucket } from './storage.js';
import { errorHandler } from './errorHandler.js';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const app = express();

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