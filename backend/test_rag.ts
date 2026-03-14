import { RagService } from './src/services/rag.service';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Starting test...");
        const profile = {
            scores: { depression: 60, anxiety: 70 },
            patterns: [{ name: "High Anxiety", confidence: 0.9, contributors: [] }],
            risk: { overall_risk: "high", flags: {} }
        };
        const res = await RagService.generateMentorReport(profile);
        console.log("Success:", JSON.stringify(res, null, 2));
    } catch (e: any) {
        require('fs').writeFileSync('err.json', JSON.stringify({ message: e.message, status: e.status, stack: e.stack }, null, 2));
        console.error("Wrote error to err.json");
    }
}
test();
