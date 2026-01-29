import { SES } from "@aws-sdk/client-ses";
import { createMimeMessage } from "mimetext";

const ses = new SES();

export async function sendMagicLinkEmail({ email, url }: { email: string; url: string }) {
  try {
    // Create MIME message
    const msg = createMimeMessage();
    msg.setSender("Finances Sentiers Frontaliers <finances@sentiersfrontaliers.com>");
    msg.setRecipients([email]);
    msg.setSubject(`Votre lien magique pour vous connecter`);

    // Add HTML part
    msg.addMessage({
      contentType: "text/html",
      data: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f6f6f6; padding: 40px 20px;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #16a34a; margin-bottom: 24px;">Votre lien de connexion</h1>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 16px;">Cliquez sur le bouton ci-dessous pour vous connecter à votre compte :</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0; font-weight: 500;">
              Se connecter
            </a>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 16px;">Ou copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #16a34a; font-size: 14px;">${url}</p>
            <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 24px;">
              <p style="color: #718096; font-size: 14px; line-height: 1.6;">
                Ce lien expire dans 5 minutes. Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    const result = await ses.sendRawEmail({
      RawMessage: { Data: Buffer.from(msg.asRaw()) },
    });
  } catch (error) {
    console.error("Error sending magic link email:", error);
    throw error;
  }
}
