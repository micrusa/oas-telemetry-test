import express, { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Mock User Management API is running' });
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });
  next();
});

// In-memory user storage
interface User {
  id: string;
  name: string;
  email: string;
}

const users: Record<string, User> = {
  '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
  '2': { id: '2', name: 'Bob', email: 'bob@example.com' },
};

// Swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Endpoints ---

// List all users
app.get('/users', (req: Request, res: Response) => {
  logger.info('Fetching all users');
  res.status(200).json(Object.values(users));
});

// Create a new user
app.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const newUser = { id, name, email };
  users[id] = newUser;
  logger.info('User created', { userId: id });
  res.status(201).json(newUser);
});

// Get user by ID
app.get('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = users[id];
  if (user) {
    logger.info('User found', { userId: id });
    res.status(200).json(user);
  } else {
    logger.warn('User not found', { userId: id });
    res.status(404).json({ error: 'User not found' });
  }
});

// Update user
app.put('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, email } = req.body;
  if (users[id]) {
    users[id] = { ...users[id], name, email };
    logger.info('User updated', { userId: id });
    res.status(200).json(users[id]);
  } else {
    logger.warn('Update failed: user not found', { userId: id });
    res.status(404).json({ error: 'User not found' });
  }
});

// Delete user
app.delete('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (users[id]) {
    delete users[id];
    logger.info('User deleted', { userId: id });
    res.status(204).send();
  } else {
    logger.warn('Delete failed: user not found', { userId: id });
    res.status(404).json({ error: 'User not found' });
  }
});

// Always fail
app.get('/error', (req: Request, res: Response) => {
  logger.error('Intentional failure triggered');
  res.status(500).json({ error: 'Always fails' });
});

// Always slow
app.get('/slow', async (req: Request, res: Response) => {
  const delay = 2000;
  logger.info(`Processing slow request... (${delay}ms)`);
  await new Promise(resolve => setTimeout(resolve, delay));
  logger.info('Slow request complete');
  res.status(200).json({ message: 'Success after delay', delay });
});

// Always fast
app.get('/fast', (req: Request, res: Response) => {
  logger.info('Processing fast request');
  res.status(200).json({ message: 'Success fast' });
});

// Random error
app.get('/random-error', (req: Request, res: Response) => {
  const fail = Math.random() > 0.5;
  if (fail) {
    logger.error('Random failure occurred');
    res.status(500).json({ error: 'Random failure' });
  } else {
    logger.info('Random success occurred');
    res.status(200).json({ message: 'Random success' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, () => {
  logger.info(`Microservice listening at http://localhost:${port}`);
  logger.info(`Swagger UI available at http://localhost:${port}/api-docs`);
});
