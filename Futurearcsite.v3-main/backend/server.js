// Importera nödvändiga moduler
const express = require('express');
const cors = require('cors');
// dotenv behövs bara lokalt, Vercel injicerar variablerna automatiskt
// require('dotenv').config(); 
const nodemailer = require('nodemailer');

console.log("🛠 Serverless Function startar...");

// Supabase klientinstans
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Express applikation
const app = express();

// Middleware
app.use(express.json());
// CORS-konfiguration
app.use(cors({
  origin: ['https://futurearc.se', 'https://www.futurearc.se'], // Tillåt endast din domän
  methods: ['GET', 'POST', 'OPTIONS'], // Tillåt dessa HTTP-metoder
  allowedHeaders: ['Content-Type'], // Tillåt Content-Type header
}));

// Hantera preflight-requests (OPTIONS-förfrågningar)
app.options('*', cors());

// API-route för kontaktformulär
app.post('/api/mail/sendmail', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Detaljerad loggning (syns i Vercel-loggar)
    console.log(`\n--- Inkommande förfrågan ---`);
    console.log(`Metod: ${req.method}`);
    console.log(`Sökväg: ${req.path}`);
    console.log(`Ursprung: ${req.headers.origin}`);
    console.log('Kropp:', { name, email, message });
    console.log(`------------------------\n`);

    // Validering av inkommande data
    if (!name || !email || !message) {
      console.error("❌ Valideringsfel: Saknade fält.");
      return res.status(400).json({ ok: false, error: "Namn, e-post och meddelande krävs." });
    }

    // Försök lagra meddelande i Supabase
    console.log('📩 Försöker lagra meddelande i Supabase:', { name, email, message });
    const { data, error: supabaseError } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message }]);

    if (supabaseError) {
      console.error("❌ Supabase-fel vid lagring:", supabaseError);
      return res.status(500).json({ ok: false, error: "Serverfel vid lagring av meddelande." });
    }

    // Konfigurera Nodemailer för e-postskickning
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Hämtas från Vercel Environment Variables
        pass: process.env.EMAIL_PASS, // Hämtas från Vercel Environment Variables
      },
    });

    // E-post till administratören
    const mailToAdmin = {
      from: 'info@futurearc.se', // Avsändaradress som visas för mottagaren
      to: process.env.ADMIN_EMAIL, // Mottagaradress för admin (från Vercel Env Vars)
      subject: 'Nytt meddelande från kontaktformulär',
      text: `Namn: ${name}\nE-post: ${email}\nMeddelande: ${message}`
    };

    // E-post till användaren (bekräftelse)
    const mailToUser = {
      from: 'info@futurearc.se', // Avsändaradress som visas för mottagaren
      to: email, // Användarens e-post från formuläret
      subject: 'Tack för ditt meddelande!',
      text: `Hej ${name},\n\nTack för att du kontaktade Futurearc. Vi återkommer till dig så snart som möjligt.\n\nDitt meddelande:\n"${message}"`
    };

    // Försök skicka e-postmeddelanden
    try {
      await transporter.sendMail(mailToAdmin);
      await transporter.sendMail(mailToUser);
      console.log("📧 E-post skickade framgångsrikt!");
    } catch (emailError) {
      console.error("❌ Fel vid e-postskickning:", emailError);
      // Returnera ett felmeddelande men indikera att meddelandet sparades i Supabase
      return res.status(500).json({ ok: false, error: "Meddelande sparades men e-post kunde inte skickas. Kontrollera Nodemailer-inställningar i Vercel." });
    }

    // Om allt lyckades
    console.log("✅ Meddelande sparat i Supabase och e-post skickat!");
    res.status(200).json({ ok: true, message: "Tack! Ditt meddelande har skickats." });

  } catch (error) {
    // Fånga eventuella oväntade fel
    console.error("❌ Ett oväntat serverfel uppstod:", error);
    res.status(500).json({ ok: false, error: "Serverfel. Försök igen senare." });
  }
});

// Enkel health check route för att testa att serverless-funktionen är aktiv
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend är igång!' });
});

// Vercel Serverless Function måste exportera Express-applikationen
// Denna del ersätter app.listen() som används för lokala servrar
module.exports = app;
