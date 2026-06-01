"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const winston_1 = __importDefault(require("winston"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
// Logger setup
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(),
    ],
});
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
    });
    next();
});
const users = {
    '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
    '2': { id: '2', name: 'Bob', email: 'bob@example.com' },
};
// Swagger UI
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// --- Endpoints ---
// List all users
app.get('/users', (req, res) => {
    logger.info('Fetching all users');
    res.status(200).json(Object.values(users));
});
// Create a new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const newUser = { id, name, email };
    users[id] = newUser;
    logger.info('User created', { userId: id });
    res.status(201).json(newUser);
});
// Get user by ID
app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    const user = users[id];
    if (user) {
        logger.info('User found', { userId: id });
        res.status(200).json(user);
    }
    else {
        logger.warn('User not found', { userId: id });
        res.status(404).json({ error: 'User not found' });
    }
});
// Update user
app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;
    if (users[id]) {
        users[id] = { ...users[id], name, email };
        logger.info('User updated', { userId: id });
        res.status(200).json(users[id]);
    }
    else {
        logger.warn('Update failed: user not found', { userId: id });
        res.status(404).json({ error: 'User not found' });
    }
});
// Delete user
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    if (users[id]) {
        delete users[id];
        logger.info('User deleted', { userId: id });
        res.status(204).send();
    }
    else {
        logger.warn('Delete failed: user not found', { userId: id });
        res.status(404).json({ error: 'User not found' });
    }
});
// Always fail
app.get('/error', (req, res) => {
    logger.error('Intentional failure triggered');
    res.status(500).json({ error: 'Always fails' });
});
// Always slow
app.get('/slow', async (req, res) => {
    const delay = 2000;
    logger.info(`Processing slow request... (${delay}ms)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    logger.info('Slow request complete');
    res.status(200).json({ message: 'Success after delay', delay });
});
// Always fast
app.get('/fast', (req, res) => {
    logger.info('Processing fast request');
    res.status(200).json({ message: 'Success fast' });
});
// Random error
app.get('/random-error', (req, res) => {
    const fail = Math.random() > 0.5;
    if (fail) {
        logger.error('Random failure occurred');
        res.status(500).json({ error: 'Random failure' });
    }
    else {
        logger.info('Random success occurred');
        res.status(200).json({ message: 'Random success' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
});
app.listen(port, () => {
    logger.info(`Microservice listening at http://localhost:${port}`);
    logger.info(`Swagger UI available at http://localhost:${port}/api-docs`);
});
