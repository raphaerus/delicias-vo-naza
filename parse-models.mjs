import fs from 'fs';

try {
    const content = fs.readFileSync('models.json', 'utf16le'); // Try reading as UTF-16LE first
    // If that fails or looks wrong, we might try utf8, but let's see.
    // Actually, standard node fs reading utf16le might be tricky if BOM is present or not.
    // Let's try to read it as buffer and detect.
} catch (e) {
    // ignore
}

// Simpler approach: let node handle it if possible, or use the file created by curl directly if it was simple.
// PowerShell > usually creates UTF-16LE with BOM.
// Let's just use a script that tries to listing names.

const raw = fs.readFileSync('models.json', 'ucs2'); // ucs2 is alias for utf16le in node buffers sort of
console.log("Raw length:", raw.length);

try {
    const data = JSON.parse(raw);
    const names = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name);
    console.log("Available Models for generateContent:");
    console.log(JSON.stringify(names, null, 2));
} catch (e) {
    console.error("Parse failed:", e.message);
    // Fallback: try utf8 if maybe it wasn't utf16
    try {
        const raw8 = fs.readFileSync('models.json', 'utf8');
        const data = JSON.parse(raw8);
        const names = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
        console.log("Available Models (UTF8 match):", JSON.stringify(names, null, 2));
    } catch (e2) {
        console.error("UTF8 Parse failed too:", e2.message);
    }
}
