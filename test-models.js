const { GoogleGenerativeAI } = require("@google/generative-ai");

// This will run in Node.js, so we need to manually pass the key or use process.env
// Asking user to paste key here temporarily for the script, or we try to read .env.local
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

        console.log("Fetching available models...");
        // There isn't a direct listModels on the SDK client in some versions, 
        // but we can try a simple generation on 'gemini-pro' to see if that works at least.
        // Actually, the SDK *does* have getGenerativeModel, but listing might be restricted.
        // Let's test standard 'gemini-pro' which is the most common fallback.

        const modelsToTest = [
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash",
            "gemini-3-pro-preview",
            "gemini-3-flash-preview",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ];

        for (const modelName of modelsToTest) {
            console.log(`Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} is working.`);
                console.log("Response:", result.response.text());
                return; // Found a working one
            } catch (e) {
                console.error(`FAILED: ${modelName}`, e.message.split('\n')[0]);
            }
        }

    } catch (e) {
        console.error("Script failed:", e);
    }
}

main();
