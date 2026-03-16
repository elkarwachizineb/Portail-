import "dotenv/config";
import express from "express";
import cors from "cors";
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
