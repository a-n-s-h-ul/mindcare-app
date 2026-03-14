const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Auth API for production system
 * - Students: Google OAuth only (@kiit.ac.in)
 * - Mentor: OTP only (mentor@kiit.ac.in)
 */
export const authApi = {
    /**
     * Student login via Google OAuth
     * Only @kiit.ac.in domains allowed
     */
    loginWithGoogle: async (idToken: string) => {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    /**
     * Mentor OTP request
     * Only works for mentor@kiit.ac.in
     */
    loginMentor: async (email: string) => {
        const res = await fetch(`${API_URL}/auth/mentor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        return data;
    },

    /**
     * Mentor OTP verification
     */
    verifyMentorOtp: async (email: string, otp: string) => {
        const res = await fetch(`${API_URL}/auth/mentor/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid OTP');
        return data;
    },

    /**
     * Get current user info
     */
    getMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Logout
     */
    logout: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get stored token
     */
    getToken: () => localStorage.getItem('token'),

    /**
     * Get stored user
     */
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if authenticated
     */
    isAuthenticated: () => !!localStorage.getItem('token'),

    /**
     * Check if user is mentor
     */
    isMentor: () => {
        const user = authApi.getUser();
        return user?.role === 'mentor';
    },

    /**
     * Check if user is student
     */
    isStudent: () => {
        const user = authApi.getUser();
        return user?.role === 'student';
    }
};
