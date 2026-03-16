import { RequestHandler } from "express";

/**
 * Send registration data to admin via WhatsApp
 * Uses Twilio WhatsApp API
 */
export const handleSendRegistrationWhatsApp: RequestHandler = async (req, res) => {
  try {
    const { formData } = req.body;

    if (!formData) {
      return res.status(400).json({ error: "No form data provided" });
    }

    const twilioAccountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.VITE_TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.VITE_TWILIO_PHONE_NUMBER;
    const adminWhatsApp = process.env.VITE_ADMIN_WHATSAPP;

    if (!twilioAccountSid || !twilioAuthToken || !fromNumber || !adminWhatsApp) {
      return res.status(500).json({ error: "Twilio configuration missing" });
    }

    // Build WhatsApp message with registration data
    const message = formatRegistrationMessage(formData);

    // Send via Twilio
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
          Body: message,
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Twilio error:", error);
      return res.status(500).json({ error: "Failed to send WhatsApp message" });
    }

    const data = await response.json();
    res.json({ success: true, messageId: (data as any).sid });
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Handle incoming WhatsApp ideas
 */
export const handleIncomingIdea: RequestHandler = async (req, res) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).json({ error: "Invalid WhatsApp message" });
    }

    // Log the idea (you can save to Supabase here)
    console.log(`New idea from ${From}: ${Body}`);

    // Send confirmation
    const twilioAccountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.VITE_TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.VITE_TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && fromNumber) {
      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${twilioAccountSid}:${twilioAuthToken}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: From,
            Body: "شكراً على فكرتك! تم استقبال اقتراحك بنجاح.\nThank you for your idea! Your suggestion has been received.",
          }).toString(),
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error handling incoming idea:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Format registration data into WhatsApp message
 */
function formatRegistrationMessage(formData: any): string {
  const lines = [
    "🎉 تسجيل عضو جديد | New Registration",
    "━━━━━━━━━━━━━━━━━━━━━",
    "",
    "👤 الاسم | Name:",
    `${formData.firstName} ${formData.lastName}`,
    "",
    "📱 الهاتف | Phone:",
    formData.userPhone || "N/A",
    "",
    "📅 تاريخ الميلاد | Birth Date:",
    formData.birthDate || "N/A",
    "",
    "⚧ الجنس | Gender:",
    formData.gender === "male" ? "ذكر | Male" : "أنثى | Female",
    "",
    "🎖️ الفريق | Patrol:",
    formData.patrol || "N/A",
    "",
    "👔 الدور | Role:",
    formData.role || "N/A",
    "",
    "👨‍👩‍👧 الولي | Guardian:",
    `${formData.guardianFirstName} ${formData.guardianLastName}`,
    "",
    "🔗 الصفة | Relationship:",
    formData.guardianRelationship || "N/A",
    "",
    "📞 هاتف الأب | Father Phone:",
    formData.fatherPhone || "N/A",
    "",
    "📞 هاتف الأم | Mother Phone:",
    formData.motherPhone || "N/A",
    "",
    "📞 هاتف المنزل | Home Phone:",
    formData.homePhone || "N/A",
    "",
    "📝 ملاحظات | Notes:",
    formData.additionalInfo || "N/A",
    "",
    "━━━━━━━━━━━━━━━━━━━━━",
    "✅ تم التسجيل بنجاح",
  ];

  return lines.join("\n");
}
