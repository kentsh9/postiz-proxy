import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 用于 Meta Webhook 验证
const VERIFY_TOKEN = "postiz_ig_token_123";

// ✅ 你的主服务器（Postiz）的接收端口
const FORWARD_URL = "http://94.72.121.228:5000/api/facebook/webhook";

// Webhook 验证 (GET)
app.get("/facebook/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Facebook webhook verified");
    res.status(200).send(challenge);
  } else {
    console.warn("❌ Verification failed: invalid token");
    res.sendStatus(403);
  }
});

// Webhook 接收 (POST)
app.post("/facebook/webhook", async (req, res) => {
  try {
    console.log("📩 Received Webhook:", JSON.stringify(req.body, null, 2));

    // 转发给主服务器
    const response = await axios.post(FORWARD_URL, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("✅ Forwarded to backend:", response.status);
  } catch (error) {
    console.error("❌ Forwarding failed:", error.message);
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 Proxy running on port 3000");
});
