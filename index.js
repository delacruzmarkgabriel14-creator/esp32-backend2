const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Latest sensor data
let latestData = { temperature: null, humidity: null, fan: null, limit: null };

// Path for logs.json
const logsFile = path.join(__dirname, "logs.json");

// Ensure logs.json exists
if (!fs.existsSync(logsFile)) {
    fs.writeFileSync(logsFile, "[]");
}

// Append a log entry with PH local time
function appendLog(entry) {
    let logs = JSON.parse(fs.readFileSync(logsFile));
    const phTime = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    logs.push({ time: phTime, message: entry });
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
}

// Serve logs.json
app.get("/logs", (req, res) => {
    res.sendFile(logsFile);
});

// Track last temperature state for crossing detection
let lastAboveLimit = false;

// Receive sensor data
app.post("/api/data", (req, res) => {
    const data = req.body;
    latestData = data;

    if (data.temperature !== null && data.limit !== null) {
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

// Serve latest sensor data
app.get("/api/data", (req, res) => {
    res.json(latestData);
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
