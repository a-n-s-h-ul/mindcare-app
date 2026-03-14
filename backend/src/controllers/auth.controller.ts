import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * Auth Controller
 * NOTE: Most auth logic is now handled directly in auth.ts routes
 * This controller is kept for backward compatibility but may be deprecated
 */
export class AuthController {

    // Student Google login
    static async loginWithGoogle(req: Request, res: Response) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ error: 'Google ID token required' });
            }
            const result = await AuthService.loginWithGoogle(idToken);
            res.json(result);
        } catch (err: any) {
            // Return 403 for domain restriction errors
            if (err.message.includes('KIIT email')) {
                return res.status(403).json({ error: err.message });
            }
            res.status(401).json({ error: err.message });
        }
    }

    // Mentor OTP request
    static async mentorLogin(req: Request, res: Response) {
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
    }

    // Mentor OTP verify
    static async verifyMentorOtp(req: Request, res: Response) {
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
    }

    static async getMe(req: Request, res: Response) {
        const user = (req as any).user;
        res.json({ user });
    }

    static async logout(req: Request, res: Response) {
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
    }
}
