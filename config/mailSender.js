const SibApiV3Sdk = require("@getbrevo/brevo");

// Initialize the Brevo transactional email engine API node client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Authenticate via your secure environment variable token string
const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const mailSender = async (email, title, body) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = title;
        sendSmtpEmail.htmlContent = body;
        sendSmtpEmail.sender = {
            name: "Synapse Chat Gateway",
            email: process.env.BREVO_SENDER_EMAIL
        };
        sendSmtpEmail.to = [{ email: email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`📡 Production OTP packet routed via Brevo Cloud. Message ID: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error("⚠️ Brevo Cloud Delivery Failure:", error.message);
    }
};

module.exports = mailSender;