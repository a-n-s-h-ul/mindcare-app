import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', (req: Request, res: Response) => {
    // Return mock stats
    res.json({
        totalAssessments: 120,
        redCases: [],
        orangeCases: [],
        escalationsThisWeek: 2
    });
});

router.get('/case/:id', (req: Request, res: Response) => {
    res.json({ caseId: req.params.id, status: 'mock' });
});

export default router;
