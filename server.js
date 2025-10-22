import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// ✅ Meta 验证令牌（保持一致）
const VERIFY_TOKEN = "postiz_ig_token_123";

// ✅ 你的 Postiz 主服务地址（修改为你自己的）
const FORWARD_URL = "https://postiz.agrrobotics.com/facebook/webhook";

// ✅ Render 提供的动态端口（本地则用 3000）
const PORT = process.env.PORT || 3000;

// ====== GET 验证接口 ======
app.get("/facebook/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Facebook webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.warn("❌ Verification failed: invalid token or mode");
    res.sendStatus(403);
  }
});

// ====== POST Webhook 接收与转发 ======
app.post("/facebook/webhook", async (req, res) => {
  console.log("📩 Received Webhook Event:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const response = await axios.post(FORWARD_URL, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
    console.log(`✅ Forwarded to backend: HTTP ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.error(`❌ Backend error: ${error.response.status}`);
    } else if (error.request) {
      console.error("⚠️ No response from backend (timeout or network issue)");
    } else {
      console.error("❌ Forwarding failed:", error.message);
    }
  }

  res.sendStatus(200);
});

// ====== 启动服务 ======
app.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});
