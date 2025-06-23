import nodemailer from "nodemailer";

// 📦 SMTP konfigurace
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Ověření spojení při startu aplikace
export async function verifyConnection() {
  try {
    await transporter.verify();
    console.log("✅ SMTP připojení navázáno.");
  } catch (err) {
    console.error("❌ SMTP připojení selhalo:", err);
  }
}

// 📬 Obecná funkce pro odesílání e-mailů
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Správa Bytů" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    // Pokud používáš Ethereal, zobraz URL pro náhled
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📤 Náhled e-mailu:", previewUrl);
    }
  } catch (error) {
    console.error("❌ Chyba při odesílání e-mailu:", error);
    throw new Error("Nepodařilo se odeslat e-mail.");
  }
}

// 🎯 Specifická funkce pro odeslání e-mailu pro reset hesla
export async function sendResetEmail(to: string, resetLink: string) {
  const subject = "Obnovení hesla - Správa Bytů";
  const text = `Odkaz pro obnovení hesla: ${resetLink}`;
  const html = `
    <p>Požádali jste o obnovení hesla.</p>
    <p>Klikněte na následující odkaz:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Pokud jste o obnovení nepožádali, tento e-mail ignorujte.</p>
  `;

  await sendEmail({ to, subject, text, html });
}
