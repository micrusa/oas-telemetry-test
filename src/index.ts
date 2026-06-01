import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { createRouter } from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/', createRouter());

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR] Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`[INFO] Microservice listening at http://localhost:${port}`);
  console.log(`[INFO] Swagger UI available at http://localhost:${port}/api-docs`);
});
