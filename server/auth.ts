import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDbClient, dbName, findDocs, saveDoc } from './db.js';

export const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lifescore_secret_key_123';

// Register
authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const users = await findDocs({ type: 'user', email });
    if (users.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      type: 'user',
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const saved = await saveDoc(newUser);
    const token = jwt.sign({ userId: saved.id, email, username }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: saved.id, username, email, role: 'user' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await findDocs({ type: 'user', email });
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check Auth (Me)
authRouter.get('/me', async (req: any, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ authenticated: false });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    res.json({ 
      authenticated: true, 
      user: { id: decoded.userId, username: decoded.username, email: decoded.email, role: 'user' } 
    });
  } catch (err) {
    res.json({ authenticated: false });
  }
});

// Middleware for protecting API routes
export const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
