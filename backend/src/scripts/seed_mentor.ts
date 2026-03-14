import pool from '../db/pool';

async function seedMentor() {
    try {
        const email = 'mentor@kiit.ac.in';
        console.log(`Seeding Mentor User: ${email}`);

        // Check if exists
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (check.rows.length > 0) {
            await pool.query("UPDATE users SET role = 'mentor' WHERE email = $1", [email]);
            console.log('Updated existing user to mentor role');
        } else {
            await pool.query(
                "INSERT INTO users (email, roll_no, auth_provider, verified, role) VALUES ($1, NULL, 'kiit', true, 'mentor')",
                [email]
            );
            console.log('Created new mentor user');
        }

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await pool.end();
    }
}

seedMentor();
