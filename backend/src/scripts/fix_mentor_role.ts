
import pool from '../db/pool';

async function fixMentorRole() {
    console.log('--- Checking Mentor User Role ---');
    try {
        const email = 'mentor@kiit.ac.in';

        // 1. Check current status
        const res = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log('User not found. Creating...');
            await pool.query("INSERT INTO users (email, roll_no, auth_provider, verified, role) VALUES ($1, NULL, 'kiit', true, 'mentor')", [email]);
            console.log('Created mentor user.');
        } else {
            const user = res.rows[0];
            console.log('Found User:', user);

            if (user.role !== 'mentor') {
                console.log(`Role mismatch! Current: ${user.role}. Updating to 'mentor'...`);
                await pool.query("UPDATE users SET role = 'mentor' WHERE email = $1", [email]);
                console.log('Role updated successfully.');
            } else {
                console.log('Role is already correct.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

fixMentorRole();
