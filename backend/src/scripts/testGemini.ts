import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testModels() {
    const results: any = {};
    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
        'gemma-3-1b-it',
    ];

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello in one word.');
            results[modelName] = {
                success: true,
                response: result.response.text().substring(0, 100)
            };
            break; // stop on first success
        } catch (e: any) {
            const is429 = e.message.includes('429');
            results[modelName] = { success: false, quotaExhausted: is429, error: e.message.substring(0, 200) };
        }
    }

    fs.writeFileSync(path.resolve(__dirname, '../../test-results.json'), JSON.stringify(results, null, 2));
    process.exit(0);
}

testModels();
