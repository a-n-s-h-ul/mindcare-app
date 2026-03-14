import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { env } from '../config/env';
import { validateKiitEmail } from '../utils/validation';
import nodemailer from 'nodemailer';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const JWT_SECRET = env.JWT_SECRET || 'dev_secret_key';

// Single mentor email - hardcoded for production
const MENTOR_EMAIL = 'mentor@kiit.ac.in';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export class AuthService {
    // ==========================================
    // STUDENT AUTH: Google OAuth ONLY
    // ==========================================

    /**
     * Student login via Google OAuth
     * ONLY allows @kiit.ac.in domain
     */
    static async loginWithGoogle(credential: string, type: 'id_token' | 'access_token' = 'id_token') {
        let email: string;

        if (type === 'id_token') {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new Error('Invalid Google ID Token');
            }
            email = payload.email;
        } else {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${credential}` }
            });
            if (!response.ok) {
                throw new Error('Invalid Google Access Token');
            }
            const data: any = await response.json();
            if (!data || !data.email) {
                throw new Error('No email found in Google profile');
            }
            email = data.email as string;
        }

        // STRICT: Only @kiit.ac.in domain allowed for students
        if (!validateKiitEmail(email)) {
            throw new Error('Access restricted to KIIT email addresses (@kiit.ac.in) only');
        }

        // Student login - create or get user
        let user = await this.findUserByEmail(email);
        if (!user) {
            const rollNo = this.extractRollNumberFromEmail(email);
            user = await this.createUser({
                email,
                rollNo,
                authProvider: 'google',
                verified: true,
                role: 'student'
            });
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        return this.createSession(user.id);
    }

    // ==========================================
    // MENTOR AUTH: OTP Only (Single Account)
    // ==========================================

    /**
     * Initiate mentor login - sends OTP
     * Only works for mentor@kiit.ac.in
     */
    static async initiateMentorLogin(email: string) {
        // Strict: Only the designated mentor email
        if (email.toLowerCase() !== MENTOR_EMAIL) {
            throw new Error('Invalid mentor credentials');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await pool.query(
            'INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        console.log(`[MENTOR OTP] Generated for ${email}`);

        // Send OTP via Email
        if (env.EMAIL_USER && env.EMAIL_APP_PASSWORD) {
            try {
                await transporter.sendMail({
                    from: `"KIIT Wellness Space" <${env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Your Mentor Login OTP',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">KIIT Wellness Space</h1>
                            </div>
                            <div style="padding: 30px; background-color: #ffffff;">
                                <h2 style="color: #1e293b; margin-top: 0;">Login Verification</h2>
                                <p style="color: #475569; font-size: 16px; line-height: 1.5;">You are attempting to log in to the Mentor Dashboard. Please use the following One-Time Password (OTP) to complete your verification.</p>
                                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                    <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">${otp}</span>
                                </div>
                                <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: bold;">This code expires in 10 minutes.</p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">If you did not request this login, please ignore this email or contact administration.</p>
                            </div>
                        </div>
                    `
                });
                console.log(`[MENTOR OTP] Email sent successfully to ${email}`);
            } catch (error) {
                console.error(`[MENTOR OTP] Failed to send email to ${email}:`, error);
                throw new Error('Failed to send OTP email. Please try again.');
            }
        } else {
            console.warn(`[MENTOR OTP] EMAIL_USER or EMAIL_APP_PASSWORD not configured in .env. Falling back to console logging.`);
            console.log(`[MENTOR OTP] OTP (Fallback): ${otp}`);
        }

        return {
            message: 'OTP sent successfully',
            devOtp: (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) ? otp : undefined 
        };
    }

    /**
     * Verify mentor OTP and create session
     */
    static async verifyMentorOtp(email: string, otp: string) {
        if (email.toLowerCase() !== MENTOR_EMAIL) {
            throw new Error('Invalid mentor credentials');
        }

        const res = await pool.query(
            'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND used = FALSE AND expires_at > NOW()',
            [email, otp]
        );

        if (res.rows.length === 0) {
            throw new Error('Invalid or expired OTP');
        }

        // Mark OTP as used
        await pool.query('UPDATE otps SET used = TRUE WHERE id = $1', [res.rows[0].id]);

        // Create or get mentor user
        let user = await this.findUserByEmail(email);
        if (!user) {
            user = await this.createUser({
                email,
                rollNo: null,
                authProvider: 'kiit',
                verified: true,
                role: 'mentor'
            });

            // Also create mentor profile
            await pool.query(
                'INSERT INTO mentors (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
                [user.id]
            );
        } else if (user.role !== 'mentor') {
            // Ensure mentor role
            await pool.query("UPDATE users SET role = 'mentor' WHERE id = $1", [user.id]);
            user.role = 'mentor';
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        return this.createSession(user.id);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    static async findUserByEmail(email: string) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    }

    static async createUser(data: {
        email: string;
        rollNo: string | null;
        authProvider: string;
        verified: boolean;
        role: string
    }) {
        const res = await pool.query(
            'INSERT INTO users (email, roll_no, auth_provider, verified, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [data.email, data.rollNo, data.authProvider, data.verified, data.role]
        );
        return res.rows[0];
    }

    static async createSession(userId: string) {
        const user = await this.getUserById(userId);
        const token = jwt.sign(
            { userId, role: user.role },
            env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await pool.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userId, token, expiresAt]
        );

        return { token, user };
    }

    static async getUserById(userId: string) {
        const res = await pool.query(
            'SELECT id, email, roll_no, auth_provider, role FROM users WHERE id = $1',
            [userId]
        );
        return res.rows[0];
    }

    static extractRollNumberFromEmail(email: string): string | null {
        // Extract roll number from email like 12345678@kiit.ac.in
        const match = email.match(/^(\d{8})@kiit\.ac\.in$/i);
        return match ? match[1] : null;
    }

    /**
     * Validate session token
     */
    static async validateSession(token: string) {
        try {
            const decoded: any = jwt.verify(token, env.JWT_SECRET);

            const sessionRes = await pool.query(
                'SELECT * FROM sessions WHERE user_id = $1 AND token = $2 AND expires_at > NOW()',
                [decoded.userId, token]
            );

            if (sessionRes.rows.length === 0) {
                return null;
            }

            return await this.getUserById(decoded.userId);
        } catch {
            return null;
        }
    }

    /**
     * Logout - invalidate session
     */
    static async logout(token: string) {
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
        return { message: 'Logged out successfully' };
    }
}
