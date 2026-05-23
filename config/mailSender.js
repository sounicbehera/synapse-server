const { BrevoClient } = require("@getbrevo/brevo");

// 1. Instantiate the Brevo client safely with the API key
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.log("⚠️ Warning: BREVO_API_KEY parameter missing from environment variables.");
}

const client = new BrevoClient({
  apiKey: apiKey || "dummy_key"
});

const mailSender = async (email, title, body) => {
  try {
    // 2. Construct and transmit the transactional email packet
    const data = await client.transactionalEmails.sendTransacEmail({
      subject: title,
      htmlContent: body,
      sender: { 
        name: "Synapse Chat Gateway", 
        email: process.env.BREVO_SENDER_EMAIL || "verification@synapsechat.com" 
      },
      to: [{ email: email }]
    });

    console.log(`📡 Production OTP packet routed via Brevo Cloud. ID: ${data.body?.messageId || "Success"}`);
    return data;
  } catch (error) {
    console.error("⚠️ Brevo Cloud Delivery Failure:", error.message);
  }
};

module.exports = mailSender;