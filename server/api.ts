import express from 'express';
import { authenticate } from './auth';
import { findDocs, saveDoc } from './db';

export const apiRouter = express.Router();

// Middleware to ensure user is authenticated for all data routes
apiRouter.use(authenticate);

// CRUD for Expenses
apiRouter.get('/expenses', async (req: any, res) => {
  try {
    const data = await findDocs({
      type: 'expense',
      userId: req.user.userId
    });
    // Cloudant doesn't sort by date automatically in postFind without index, but we'll sort here
    const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

apiRouter.post('/expenses', async (req: any, res) => {
  try {
    const item = { 
      ...req.body, 
      type: 'expense', 
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };
    const result = await saveDoc(item);
    res.json({ ...item, _id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// CRUD for Fitness
apiRouter.get('/fitness', async (req: any, res) => {
  try {
    const data = await findDocs({
      type: 'fitness',
      userId: req.user.userId
    });
    const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fitness' });
  }
});

apiRouter.post('/fitness', async (req: any, res) => {
  try {
    const item = { 
      ...req.body, 
      type: 'fitness', 
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };
    const result = await saveDoc(item);
    res.json({ ...item, _id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save fitness' });
  }
});

// CRUD for Study
apiRouter.get('/study', async (req: any, res) => {
  try {
    const data = await findDocs({
      type: 'study',
      userId: req.user.userId
    });
    const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch study' });
  }
});

apiRouter.post('/study', async (req: any, res) => {
  try {
    const item = { 
      ...req.body, 
      type: 'study', 
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };
    const result = await saveDoc(item);
    res.json({ ...item, _id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save study' });
  }
});

// Life Score Calculation Logic
apiRouter.get('/score', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [expenses, fitness, study] = await Promise.all([
      findDocs({ type: 'expense', userId, date: { $gte: last30Days } }),
      findDocs({ type: 'fitness', userId, date: { $gte: last30Days } }),
      findDocs({ type: 'study', userId, date: { $gte: last30Days } }),
    ]);

    // Study Score
    const totalStudyHours = (study as any[]).reduce((acc, s) => acc + (parseFloat(s.duration) || 0), 0);
    const avgProductivity = study.length ? (study as any[]).reduce((acc, s) => acc + (parseInt(s.productivity) || 0), 0) / study.length : 0;
    const studyScore = Math.min(100, (totalStudyHours / 60) * 50 + avgProductivity * 5);

    // Fitness Score
    const totalFitnessMin = (fitness as any[]).reduce((acc, f) => acc + (parseInt(f.duration) || 0), 0);
    const fitnessScore = Math.min(100, (totalFitnessMin / 900) * 100);

    // Expenses Score
    const totalSpent = (expenses as any[]).reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    const expenseScore = Math.max(0, 100 - (totalSpent / 30));

    const lifeScore = (studyScore * 0.4) + (fitnessScore * 0.3) + (expenseScore * 0.3);

    res.json({
      lifeScore: Math.round(lifeScore),
      breakdown: {
        study: Math.round(studyScore),
        fitness: Math.round(fitnessScore),
        discipline: Math.round(expenseScore)
      },
      trends: {
        spent: totalSpent,
        fitnessMin: totalFitnessMin,
        studyHrs: totalStudyHours
      }
    });
  } catch (err) {
    console.error("Score calculation error:", err);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});
