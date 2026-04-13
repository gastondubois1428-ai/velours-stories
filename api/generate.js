export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, categorie, longueur } = req.body;

  const prompt = `Tu es un auteur de littérature romantique et sensuelle française, élégant et raffiné. 
Écris une histoire ${categorie || 'romantique'} sur le thème "${theme}".
Longueur : ${longueur || 'courte'} (environ ${longueur === 'longue' ? '800' : '400'} mots).
Style : élégant, poétique, sensuel mais jamais vulgaire. Comme du velours.
Commence directement par l'histoire, sans titre ni introduction.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const histoire = data.content[0].text;

    res.status(200).json({ histoire });
  } catch (error) {
    res.status(500).json({ error: 'Erreur de génération' });
  }
}
