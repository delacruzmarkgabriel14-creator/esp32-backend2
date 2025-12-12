const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

let latestData = { temperature: null, humidity: null, fan: null };

app.post("/api/data", (req, res) => {
  latestData = req.body;
  console.log("Received:", latestData);
  res.send("Data stored");
});

app.get("/api/data", (req, res) => {
  res.json(latestData);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
