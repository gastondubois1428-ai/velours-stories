import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { action, email, password, pseudo } = req.body

  try {
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { pseudo } }
      })
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ user: data.user, message: 'Vérifiez votre email !' })
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ user: data.user, session: data.session })
    }

  } catch(e) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
