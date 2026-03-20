import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { handleDemo } from "./routes/demo";

// Force reload of environment variables
dotenv.config({ override: true });
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

  // Twilio WhatsApp test endpoint
  app.get("/api/test-twilio", async (_req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      const toNumber = process.env.ADMIN_WHATSAPP;

      console.log("=== TWILIO TEST ===");
      console.log("Account SID:", accountSid);
      console.log("Auth Token exists:", !!authToken);
      console.log("From:", fromNumber);
      console.log("To:", toNumber);

      if (!accountSid || !authToken || !fromNumber || !toNumber) {
        return res.status(400).json({
          error: "Missing Twilio credentials",
          accountSid: !!accountSid,
          authToken: !!authToken,
          fromNumber: !!fromNumber,
          toNumber: !!toNumber,
        });
      }

      // Test message
      const testMessage = "🧪 Test WhatsApp from Fusion Starter";

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString(
              "base64"
            )}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: toNumber,
            Body: testMessage,
          }).toString(),
        }
      );

      const responseText = await response.text();
      console.log("Response Status:", response.status);
      console.log("Response Body:", responseText);

      if (!response.ok) {
        return res.status(response.status).json({
          error: "Twilio API error",
          status: response.status,
          body: responseText,
        });
      }

      const data = JSON.parse(responseText);
      res.json({
        success: true,
        message: "WhatsApp test message sent successfully",
        messageSid: (data as any).sid,
      });
    } catch (error: any) {
      console.error("Twilio test error:", error);
      res.status(500).json({
        error: error.message,
        stack: error.stack,
      });
    }
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

  // WhatsApp test with hardcoded data
  app.get("/api/test-whatsapp-send", async (_req, res) => {
    try {
      console.log("\n🧪 TESTING WHATSAPP SEND FUNCTIONALITY");
      console.log("═══════════════════════════════════════════");

      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      const adminWhatsApp = process.env.ADMIN_WHATSAPP;

      console.log("\n📋 Loaded Environment Variables:");
      console.log(`  ✓ Account SID: ${twilioAccountSid ? "Set" : "❌ MISSING"}`);
      console.log(`  ✓ Auth Token: ${twilioAuthToken ? "Set" : "❌ MISSING"}`);
      console.log(`  ✓ From Number: ${fromNumber || "❌ MISSING"}`);
      console.log(`  ✓ Admin WhatsApp: ${adminWhatsApp || "❌ MISSING"}`);

      if (!twilioAccountSid || !twilioAuthToken || !fromNumber || !adminWhatsApp) {
        return res.status(400).json({
          error: "Missing Twilio credentials",
          details: {
            accountSid: !!twilioAccountSid,
            authToken: !!twilioAuthToken,
            fromNumber: !!fromNumber,
            adminWhatsApp: !!adminWhatsApp
          }
        });
      }

      const testMessage = "🧪 Test WhatsApp Message from Fusion\nThis is a test to verify WhatsApp integration works.";

      console.log("\n📤 Sending test message to Twilio API...");
      console.log(`   From: ${fromNumber}`);
      console.log(`   To: ${adminWhatsApp}`);
      console.log(`   Message: ${testMessage.substring(0, 50)}...`);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString(
              "base64"
            )}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: adminWhatsApp,
            Body: testMessage,
          }).toString(),
        }
      );

      const responseText = await response.text();
      console.log(`\n📊 Twilio Response Status: ${response.status}`);

      if (!response.ok) {
        console.error("❌ Twilio API Error:");
        console.error(responseText);
        return res.status(response.status).json({
          error: "Twilio API error",
          status: response.status,
          details: responseText
        });
      }

      const data = JSON.parse(responseText);
      console.log("✅ Message sent successfully!");
      console.log(`   Message SID: ${(data as any).sid}`);

      res.json({
        success: true,
        message: "Test message sent successfully",
        messageSid: (data as any).sid
      });
    } catch (error: any) {
      console.error("\n❌ Test error:", error.message);
      res.status(500).json({
        error: error.message,
        type: error.constructor.name
      });
    }
  });

  // WhatsApp routes
  app.post("/api/whatsapp/send-registration", handleSendRegistrationWhatsApp);
  app.post("/api/whatsapp/incoming-idea", handleIncomingIdea);

  // Ideas routes
  app.post("/api/ideas/send-notification", handleSendIdeaNotification);

  return app;
}
