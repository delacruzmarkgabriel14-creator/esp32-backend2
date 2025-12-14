const fs = require('fs');
const path = require('path');

// Path for logs.json
const logsFile = path.join(__dirname, 'logs.json');

// Ensure logs.json exists
if (!fs.existsSync(logsFile)) {
    fs.writeFileSync(logsFile, '[]');
}

// Append a log entry
function appendLog(entry) {
    let logs = JSON.parse(fs.readFileSync(logsFile));
    logs.push({ time: new Date().toISOString(), message: entry });
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
}

// Serve logs.json via GET
app.get('/logs', (req, res) => {
    res.sendFile(logsFile);
});

// Modify POST /api/data to log only temp crossings
let lastAboveLimit = false;

app.post("/api/data", (req, res) => {
    const data = req.body;
    latestData = data;

    // Log crossing events
    if (data.temperature !== null) {
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
