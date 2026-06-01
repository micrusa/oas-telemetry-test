"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = void 0;
const express_1 = require("express");
const createRouter = () => {
    const router = (0, express_1.Router)();
    const users = {
        '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
        '2': { id: '2', name: 'Bob', email: 'bob@example.com' },
    };
    // --- Endpoints ---
    // Root
    router.get('/', (req, res) => {
        res.json({ message: 'Mock User Management API is running' });
    });
    // List all users
    router.get('/users', (req, res) => {
        console.info('[INFO] Fetching all users');
        res.status(200).json(Object.values(users));
    });
    // Create a new user
    router.post('/users', (req, res) => {
        const { name, email } = req.body;
        const id = Math.random().toString(36).substr(2, 9);
        const newUser = { id, name, email };
        users[id] = newUser;
        console.info(`[INFO] User created: ${id}`);
        res.status(201).json(newUser);
    });
    // Get user by ID
    router.get('/users/:id', (req, res) => {
        const id = req.params.id;
        const user = users[id];
        if (user) {
            console.info(`[INFO] User found: ${id}`);
            res.status(200).json(user);
        }
        else {
            console.warn(`[WARN] User not found: ${id}`);
            res.status(404).json({ error: 'User not found' });
        }
    });
    // Update user
    router.put('/users/:id', (req, res) => {
        const id = req.params.id;
        const { name, email } = req.body;
        if (users[id]) {
            users[id] = { ...users[id], name, email };
            console.info(`[INFO] User updated: ${id}`);
            res.status(200).json(users[id]);
        }
        else {
            console.warn(`[WARN] Update failed: user not found: ${id}`);
            res.status(404).json({ error: 'User not found' });
        }
    });
    // Delete user
    router.delete('/users/:id', (req, res) => {
        const id = req.params.id;
        if (users[id]) {
            delete users[id];
            console.info(`[INFO] User deleted: ${id}`);
            res.status(204).send();
        }
        else {
            console.warn(`[WARN] Delete failed: user not found: ${id}`);
            res.status(404).json({ error: 'User not found' });
        }
    });
    // Always fail
    router.get('/error', (req, res) => {
        console.error('[ERROR] Intentional failure triggered');
        res.status(500).json({ error: 'Always fails' });
    });
    // Always slow
    router.get('/slow', async (req, res) => {
        const delay = 2000;
        console.info(`[INFO] Processing slow request... (${delay}ms)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.info('[INFO] Slow request complete');
        res.status(200).json({ message: 'Success after delay', delay });
    });
    // Always fast
    router.get('/fast', (req, res) => {
        console.info('[INFO] Processing fast request');
        res.status(200).json({ message: 'Success fast' });
    });
    // Random error
    router.get('/random-error', (req, res) => {
        const fail = Math.random() > 0.5;
        if (fail) {
            console.error('[ERROR] Random failure occurred');
            res.status(500).json({ error: 'Random failure' });
        }
        else {
            console.info('[INFO] Random success occurred');
            res.status(200).json({ message: 'Random success' });
        }
    });
    return router;
};
exports.createRouter = createRouter;
