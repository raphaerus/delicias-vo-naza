const apiKey = "AIzaSyB54Rodf-I6CxjwiR02APVzEXPWMpxqdyY";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

const promptText = "Hello, are you there?";

const payload = {
    contents: [{
        parts: [{ text: promptText }]
    }]
};

console.log("Sending payload:", JSON.stringify(payload, null, 2));

async function run() {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error Status:", response.status);
            console.error("Error Body:", JSON.stringify(err, null, 2));
        } else {
            const data = await response.json();
            console.log("Success! Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

run();
