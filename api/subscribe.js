// api/subscribe.js
// Fonction serverless Vercel pour inscrire un email à la liste Velours Stories Mailchimp
// Déclenche automatiquement l'email de bienvenue configuré dans Mailchimp

export default async function handler(req, res) {
  // CORS headers (au cas où)
  res.setHeader('Access-Control-Allow-Origin', 'https://velours-stories.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Seul POST accepté
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email, firstName } = req.body;

  // Validation email basique
  if (!email || !email.includes('@') || email.length < 5) {
    return res.status(400).json({
      error: 'Adresse email invalide',
    });
  }

  // Variables d'environnement Vercel
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
    console.error('Configuration Mailchimp manquante');
    return res.status(500).json({
      error: 'Configuration serveur incomplète',
    });
  }

  const MAILCHIMP_URL = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  try {
    const response = await fetch(MAILCHIMP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify({
        email_address: email.toLowerCase().trim(),
        status: 'subscribed', // déclenche le parcours de bienvenue automatiquement
        merge_fields: firstName ? { FNAME: firstName } : {},
      }),
    });

    const data = await response.json();

    // Succès
    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Bienvenue chez Velours Stories',
      });
    }

    // Déjà abonné
    if (data.title === 'Member Exists') {
      return res.status(200).json({
        success: true,
        message: 'Vous êtes déjà membre de Velours Stories',
        alreadySubscribed: true,
      });
    }

    // Email invalide selon Mailchimp
    if (data.title === 'Invalid Resource') {
      return res.status(400).json({
        error: 'Cette adresse email ne peut pas être acceptée',
      });
    }

    // Autre erreur
    console.error('Erreur Mailchimp:', data);
    return res.status(500).json({
      error: 'Une erreur est survenue, veuillez réessayer',
    });
  } catch (error) {
    console.error('Erreur réseau:', error);
    return res.status(500).json({
      error: 'Erreur de connexion, veuillez réessayer',
    });
  }
}
