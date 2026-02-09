const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function main() {
    let apiKey = "";
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY="([^"]+)"/);
        if (match) apiKey = match[1];
    } catch (err) {
        console.error("Error reading .env.local:", err.message);
    }

    console.log("Testing with API Key:", apiKey ? (apiKey.substring(0, 5) + "...") : "MISSING");

    if (!apiKey) {
        console.error("Error: NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // listModels is not on genAI directly in the same way, 
        // but we can try a simple request to a known model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Key is working'");
        console.log("Response:", result.response.text());
        console.log("SUCCESS: Key is working and active.");
    } catch (e) {
        console.error("FAILURE:", e.message);
    }
}

main();
