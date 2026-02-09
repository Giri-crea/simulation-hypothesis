const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY="([^"]+)"/);

        if (!match) {
            console.error("Could not find API Key in .env.local");
            return;
        }

        const apiKey = match[1];
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use the listModels endpoint
        // Note: listModels is on the genAI instance in newer versions or requires separate fetch
        // For simplicity, let's try to list them via the REST API directly or just test a few more names.
        // Actually, the SDK has a listModels method.

        console.log("Checking models...");
        // Some keys only support specific models. 
        // Let's test the most likely ones for a "Flash" model.
        const testModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-1.5"];

        for (const m of testModels) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`Working: ${m}`);
            } catch (e) {
                console.log(`Not Working: ${m} - ${e.message.split('\n')[0]}`);
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
