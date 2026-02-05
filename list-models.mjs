const apiKey = "AIzaSyB54Rodf-I6CxjwiR02APVzEXPWMpxqdyY";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function run() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Failed:", response.status, await response.text());
            return;
        }
        const data = await response.json();
        if (data.models) {
            console.log("Found models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found in response:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

run();
