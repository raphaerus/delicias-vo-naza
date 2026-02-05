import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyB54Rodf-I6CxjwiR02APVzEXPWMpxqdyY";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    const modelsToTest = [
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-lite-preview-02-05"
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log(`SUCCESS: ${modelName}`);
            return; // Found one!
        } catch (e) {
            console.log(`FAILED: ${modelName} - ${e.message}`);
        }
    }
    console.log("All models failed.");
}

run();
