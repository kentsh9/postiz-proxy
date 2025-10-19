import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// ✅ Meta webhook 验证
app.get("/facebook/webhook", (req, res) => {
  const VERIFY_TOKEN = "postiz_ig_token_123";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  } else {
    console.log("❌ Verification failed");
    return res.sendStatus(403);
  }
});

// ✅ 接收事件并转发给 Postiz
app.post("/facebook/webhook", async (req, res) => {
  try {
    console.log("📩 Received FB event");
    const r = await fetch("https://postiz.terramachinery.ca/facebook/1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    console.log("Forwarded to Postiz:", r.status);
    res.sendStatus(200);
  } catch (e) {
    console.error("❌ Forward error:", e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`🚀 Proxy running on ${PORT}`));
