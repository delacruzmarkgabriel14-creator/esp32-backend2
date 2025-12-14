const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();  // Must be defined first
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Path for logs.json
const logsFile = path.join(__dirname, 'logs.json');
// Ensure logs.json exists
if (!fs.existsSync(logsFile)) fs.writeFileSync(logsFile, '[]');

// Latest sensor data
let latestData = { temperature: null, humidity: null, fan: null };
let lastAboveLimit = false; // Track previous state for logging

// Helper: append log entry
function appendLog(entry) {
    let logs = JSON.parse(fs.readFileSync(logsFile));
    logs.push({ time: new Date().toISOString(), message: entry });
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
}

// GET /logs - serve the JSON log file
app.get('/logs', (req, res) => {
    res.sendFile(logsFile);
});

// POST /api/data - receive sensor updates
app.post("/api/data", (req, res) => {
    const data = req.body;
    latestData = data;

    // Log only when temperature crosses the limit
    if (data.temperature !== null && data.limit !== undefined) {
        if (data.temperature >= data.limit && !lastAboveLimit) {
            appendLog(`Temperature exceeded limit: ${data.temperature}°C`);
            lastAboveLimit = true;
        } else if (data.temperature < data.limit && lastAboveLimit) {
            appendLog(`Temperature back to normal: ${data.temperature}°C`);
            lastAboveLimit = false;
        }
    }

    res.send("Data stored");
});

// GET /api/data - send latest sensor data
app.get("/api/data", (req, res) => {
    res.json(latestData);
});

// Catch-all route
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
