import express from 'express';
import { AuthService } from '../services/auth.service';

const router = express.Router();

// ==========================================
// STUDENT AUTH ROUTES (Google Only)
// ==========================================

/**
 * POST /api/auth/google
 * Student login via Google OAuth
 * Only @kiit.ac.in domains allowed
 */
router.post('/google', async (req, res) => {
    try {
        const { idToken, accessToken } = req.body;

        if (!idToken && !accessToken) {
            return res.status(400).json({ error: 'Google ID token or Access token required' });
        }

        const credential = idToken || accessToken;
        const type = idToken ? 'id_token' : 'access_token';

        const result = await AuthService.loginWithGoogle(credential, type);
        res.json(result);
    } catch (err: any) {
        // Return 403 for domain restriction errors
        if (err.message.includes('KIIT email')) {
            return res.status(403).json({ error: err.message });
        }
        res.status(401).json({ error: err.message });
    }
});

/**
 * POST /api/auth/dev-login
 * DEV ONLY: Bypass Google OAuth for local development
 */
router.post('/dev-login', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ error: 'Not found' });
    }
    try {
        const { email: reqEmail, role: reqRole } = req.body;
        const email = reqEmail || '22053000@kiit.ac.in';
        const role = reqRole || 'student';
        let user = await AuthService.findUserByEmail(email);
        if (!user) {
            user = await AuthService.createUser({
                email,
                rollNo: email.split('@')[0],
                authProvider: 'google',
                verified: true,
                role
            });
        }
        // Update role if it doesn't match
        if (user.role !== role) {
            const pool = (await import('../db/pool')).default;
            await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, user.id]);
            user.role = role;
        }
        const result = await AuthService.createSession(user.id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// MENTOR AUTH ROUTES (OTP Only)
// ==========================================

/**
 * POST /api/auth/mentor/login
 * Initiate mentor OTP login
 * Only works for mentor@kiit.ac.in
 */
router.post('/mentor/login', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const result = await AuthService.initiateMentorLogin(email);
        res.json(result);
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
});

/**
 * POST /api/auth/mentor/verify
 * Verify mentor OTP and complete login
 */
router.post('/mentor/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP required' });
        }

        const result = await AuthService.verifyMentorOtp(email, otp);
        res.json(result);
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
});

// ==========================================
// SESSION MANAGEMENT
// ==========================================

/**
 * POST /api/auth/logout
 * Invalidate current session
 */
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            await AuthService.logout(token);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.validateSession(token);

        if (!user) {
            return res.status(401).json({ error: 'Session expired' });
        }

        res.json(user);
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
});

export default router;
