import { RequestHandler } from "express";

/**
 * Send registration data to admin via WhatsApp
 * Uses Twilio WhatsApp API
 */
export const handleSendRegistrationWhatsApp: RequestHandler = async (req, res) => {
  try {
    const { formData } = req.body;

    console.log("🔔 WhatsApp registration notification triggered");

    if (!formData) {
      console.error("❌ No formData provided");
      return res.status(400).json({ error: "No form data provided" });
    }

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const adminWhatsApp = process.env.ADMIN_WHATSAPP;

    console.log("📋 Twilio Config Check:");
    console.log(`  - Account SID: ${twilioAccountSid ? "✅ Set" : "❌ Missing"}`);
    console.log(`  - Auth Token: ${twilioAuthToken ? "✅ Set" : "❌ Missing"}`);
    console.log(`  - From Number: ${fromNumber || "❌ Missing"}`);
    console.log(`  - Admin WhatsApp: ${adminWhatsApp || "❌ Missing"}`);

    if (!twilioAccountSid || !twilioAuthToken || !fromNumber || !adminWhatsApp) {
      console.error("❌ Twilio configuration missing");
      return res.status(500).json({ error: "Twilio configuration missing" });
    }

    // Build WhatsApp message with registration data
    const message = formatRegistrationMessage(formData);
    console.log(`📝 Message prepared: ${message.substring(0, 50)}...`);

    // Send via Twilio
    console.log(`📤 Sending WhatsApp to ${adminWhatsApp}...`);
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

    console.log(`📊 Twilio Response Status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Twilio API Error:", error);
      return res.status(500).json({ error: "Failed to send WhatsApp message", details: error });
    }

    const data = await response.json();
    console.log("✅ WhatsApp message sent successfully:", (data as any).sid);
    res.json({ success: true, messageId: (data as any).sid });
  } catch (error) {
    console.error("❌ Error sending WhatsApp:", error);
    res.status(500).json({ error: "Server error", details: String(error) });
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
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

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
