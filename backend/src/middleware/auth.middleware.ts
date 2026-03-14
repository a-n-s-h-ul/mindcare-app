import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import pool from '../db/pool';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * Base authentication middleware
 * Validates JWT token and session
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (env.BYPASS_AUTH === 'true') {
        req.user = {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'tester@kiit.ac.in',
            role: req.headers['x-role'] as string || 'student'
        };
        return next();
    }

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded: any = jwt.verify(token, env.JWT_SECRET);

        // Check if session exists in DB (Strict Session Check)
        const sessionRes = await pool.query(
            'SELECT * FROM sessions WHERE user_id = $1 AND token = $2 AND expires_at > NOW()',
            [decoded.userId, token]
        );

        if (sessionRes.rows.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
        }

        // Fetch full user data
        const userRes = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        req.user = userRes.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

/**
 * Require STUDENT role
 * Use after authenticate middleware
 */
export const requireStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden: Student access only' });
    }

    next();
};

/**
 * Require MENTOR role
 * Use after authenticate middleware
 */
export const requireMentor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Mentor access only' });
    }

    next();
};

/**
 * Require ADMIN role
 * Use after authenticate middleware
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    next();
};

export type { AuthRequest };
