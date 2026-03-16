import { RequestHandler } from "express";

// Configuration Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+1234567890";
const adminWhatsApp = process.env.ADMIN_WHATSAPP || "whatsapp:+212612345678";

// Initialiser le client Twilio
let twilioClient: any = null;

try {
  if (accountSid && authToken) {
    // Import dynamique de Twilio (CommonJS)
    const twilio = require("twilio");
    twilioClient = twilio(accountSid, authToken);
  }
} catch (error) {
  console.warn("Twilio SDK non disponible:", error);
}

/**
 * Envoyer une notification WhatsApp quand une idée est soumise
 * POST /api/ideas/send-notification
 */
export const handleSendIdeaNotification: RequestHandler = async (req, res) => {
  try {
    // Vérifier que Twilio est configuré
    if (!twilioClient) {
      console.warn("Twilio non configuré - notification non envoyée");
      return res.status(200).json({
        success: false,
        message: "Service Twilio non disponible",
      });
    }

    const { ideaTitle, ideaDescription, authorName } = req.body;

    // Validation basique
    if (!ideaTitle || !ideaDescription) {
      return res.status(400).json({
        error: "ideaTitle et ideaDescription sont requis",
      });
    }

    // Composer le message WhatsApp
    const message = `
💡 *NOUVELLE IDÉE REÇUE* 💡

📌 *Titre:* ${ideaTitle}

📝 *Description:*
${ideaDescription}

👤 *Auteur:* ${authorName || "Anonyme"}

⏰ *Date/Heure:* ${new Date().toLocaleString("fr-MA")}
    `.trim();

    // Envoyer via Twilio
    const result = await twilioClient.messages.create({
      from: fromWhatsApp,
      to: adminWhatsApp,
      body: message,
    });

    console.log(`✓ Message Twilio envoyé: ${result.sid}`);

    res.json({
      success: true,
      message: "Notification WhatsApp envoyée à l'admin",
      messageSid: result.sid,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi Twilio:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi de la notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
