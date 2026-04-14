import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { titre, contenu, categorie, user_id } = req.body
    if (!titre || !contenu) return res.status(400).json({ error: 'Données manquantes' })
    const { data, error } = await supabase
      .from('histoires')
      .insert([{ titre, contenu, categorie: categorie || 'romantique', auteur: user_id || 'Anonyme' }])
      .select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ histoire: data[0] })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('histoires')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ histoires: data })
  }

  res.status(405).end()
}
