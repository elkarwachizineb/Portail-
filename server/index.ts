import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { handleDemo } from "./routes/demo";
import { handleSendRegistrationWhatsApp, handleIncomingIdea } from "./routes/whatsapp";
import { handleRegister, handleLogin, handleGetProfile, handleSavePdfQrCode } from "./routes/auth";
import { handleSendIdeaNotification } from "./routes/ideas";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Supabase connection test endpoint
  app.get("/api/test-supabase", async (_req, res) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

      console.log("=== Test Supabase endpoint called ===");
      console.log("URL:", supabaseUrl);
      console.log("Key exists:", !!supabaseKey);

      if (!supabaseUrl || !supabaseKey) {
        return res.status(400).json({
          error: "Missing Supabase credentials",
          url_present: !!supabaseUrl,
          key_present: !!supabaseKey
        });
      }

      const testClient = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await testClient.from("users").select("count", { count: "exact" }).limit(1);

      if (error) {
        console.error("❌ Supabase test error:", error);
        return res.status(400).json({
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }

      console.log("✅ Supabase test successful");
      res.json({
        success: true,
        message: "Supabase connection successful",
        data
      });
    } catch (err: any) {
      console.error("❌ Test endpoint error:", err.message);
      res.status(500).json({
        error: err.message
      });
    }
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/profile", handleGetProfile);
  app.post("/api/auth/save-documents", handleSavePdfQrCode);

  // WhatsApp routes
  app.post("/api/whatsapp/send-registration", handleSendRegistrationWhatsApp);
  app.post("/api/whatsapp/incoming-idea", handleIncomingIdea);

  // Ideas routes
  app.post("/api/ideas/send-notification", handleSendIdeaNotification);

  return app;
}
