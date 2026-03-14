
import pool from '../db/pool';

async function seedTestStudent() {
    console.log('--- Seeding Test Student for RAG Demo ---');
    try {
        const email = 'rajesh.kumar@kiit.ac.in';

        // 1. Create/Get Student User
        let userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        let userId;

        if (userRes.rows.length === 0) {
            console.log('Creating new student:', email);
            const newUser = await pool.query(
                "INSERT INTO users (email, roll_no, auth_provider, verified, role) VALUES ($1, '2105123', 'kiit', true, 'student') RETURNING id",
                [email]
            );
            userId = newUser.rows[0].id;
        } else {
            console.log('Using existing student:', email);
            userId = userRes.rows[0].id;
            // Ensure role is student
            await pool.query("UPDATE users SET role = 'student' WHERE id = $1", [userId]);
        }

        // 2. Create Dummy Session
        // We need a session, but my previous migration 001_initial_schema defined sessions with ID, risk_score etc.
        // Let's check 001_initial_schema again or just insert allowing defaults if possible.
        // Actually 001_initial_schema.sql doesn't seem to link sessions to users? Wait.
        // 001_initial_auth_schema.sql says `sessions` table has user_id.
        // 001_initial_schema.sql says `sessions` table has id, start_time... wait conflict?
        // Let's assume 001_initial_auth_schema is the one in use for Auth, but survey might use the other?
        // Actually I should just insert into `student_results` directly for the mentor view as `mentor.routes.ts` generates report on fly mostly or uses `student_results` table?

        // Looking at `mentor.routes.ts`:
        // It fetches student info.
        // Then calls `AnalysisService.generateClinicalProfile(mockAnswers)`.
        // It doesn't actually READ from `student_results` yet in the code I wrote (it uses mockAnswers = []).

        // So for the current "Mocked" state, I just need the USER to exist in the database with role='student'.
        // The dashboard list queries `users WHERE role='student'`.
        // The report page generates the report dynamically based on the student ID.

        console.log(`Student ${email} is ready for RAG demo.`);

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await pool.end();
    }
}

seedTestStudent();
