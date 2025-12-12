const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

let latestData = { temperature: null, humidity: null, fan: null, temp_limit: 30 };
let abnormal = false; // flag to track abnormal events
let logs = []; // store abnormal events

app.post("/api/data", (req, res) => {
    const data = req.body;
    latestData = data;

    // Abnormal temperature logging
    if (data.temperature !== null && data.temp_limit !== undefined) {
        if (!abnormal && data.temperature >= data.temp_limit) {
            abnormal = true;
            logs.push(`[${new Date().toLocaleString()}] Temperature abnormal started: ${data.temperature}°C`);
        } else if (abnormal && data.temperature < data.temp_limit) {
            abnormal = false;
            logs.push(`[${new Date().toLocaleString()}] Temperature back to normal: ${data.temperature}°C`);
        }
    }

    console.log("Received:", data);
    res.send("Data stored");
});

app.get("/api/data", (req, res) => {
    res.json(latestData);
});

// Optional: get logs
app.get("/api/logs", (req, res) => {
    res.json(logs);
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
