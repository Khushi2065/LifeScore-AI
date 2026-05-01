import { Router } from "express";
import AssistantV2 from "ibm-watson/assistant/v2.js";
import { IamAuthenticator } from "ibm-watson/auth/index.js";
import { authenticate } from "./auth";

export const watsonRouter = Router();

let assistant: AssistantV2 | null = null;

// ✅ LOAD ENV (DO NOT MOVE THIS)
const assistantId = process.env.WATSONX_ASSISTANT_ID;
const assistantEnvironmentId = process.env.WATSONX_ASSISTANT_ENVIRONMENT_ID;

// ✅ DEBUG (remove later)
console.log("Watson ENV CHECK:", {
  assistantId,
  assistantEnvironmentId,
});

// ✅ CREATE ASSISTANT INSTANCE
const getAssistant = () => {
  if (!assistant) {
    const apiKey = process.env.WATSONX_ASSISTANT_APIKEY;
    const serviceUrl = process.env.WATSONX_ASSISTANT_URL;

    console.log("Watson ENV:", {
      apiKey,
      serviceUrl,
      assistantId,
      assistantEnvironmentId,
    });

    if (!apiKey || !serviceUrl || !assistantId || !assistantEnvironmentId) {
      console.error("❌ Watson ENV missing");
      return null;
    }

    assistant = new AssistantV2({
      version: "2021-06-14",
      authenticator: new IamAuthenticator({
        apikey: apiKey,
      }),
      serviceUrl,
    });
  }

  return assistant;
};



// ✅ CREATE SESSION
watsonRouter.post("/session", authenticate, async (req, res) => {
  const service = getAssistant();

  if (!service || !assistantId || !assistantEnvironmentId) {
    return res.status(500).json({ error: "Watson not configured properly" });
  }

  try {
    const session = await service.createSession({
      assistantId,
      environmentId: assistantEnvironmentId,
    });

    res.json(session.result);
  } catch (err) {
    console.error("❌ Watson Session Error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});



// ✅ SEND MESSAGE (FIXED WITH user_id)
watsonRouter.post("/message", authenticate, async (req, res) => {
  const service = getAssistant();
  const { text, sessionId } = req.body;

  if (!service || !assistantId || !assistantEnvironmentId) {
    return res.status(500).json({ error: "Watson not configured properly" });
  }

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const response = await service.message({
      assistantId,
      environmentId: assistantEnvironmentId,
      sessionId,
      input: {
        message_type: "text",
        text,
      },

      // ✅ 🔥 REQUIRED FIX (THIS WAS MISSING)
      context: {
        global: {
          system: {
            user_id: "user-" + Date.now(), // or use real user id
          },
        },
      },
    });

    // ✅ SAFE RESPONSE EXTRACTION
    let reply = "⚠️ No response from Watson";

    const generics = response.result?.output?.generic;

    if (generics && Array.isArray(generics)) {
      const texts = generics
        .filter((item: any) => item.response_type === "text")
        .map((item: any) => item.text);

      if (texts.length > 0) {
        reply = texts.join("\n");
      }
    }

    res.json({
      text: reply,
      context: response.result?.context || {},
    });

  } catch (err) {
    console.error("❌ Watson Message Error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});