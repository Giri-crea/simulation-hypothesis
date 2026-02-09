const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY="([^"]+)"/);
        const apiKey = match[1];

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use a model that definitely exists to verify the key
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        try {
            const result = await model.generateContent("test");
            console.log("SUCCESS: gemini-1.5-flash is working.");
        } catch (e) {
            console.log("FAILED: gemini-1.5-flash - " + e.message);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
