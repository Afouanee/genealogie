'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if(error){ setError(error.message); return }
    setSent(true)
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
      {sent ? (
        <p>Mail envoyé. Ouvre le lien de connexion, puis reviens ici.</p>
      ) : (
        <form onSubmit={handleLogin} className="space-y-3">
          <input className="border p-2 w-full" type="email" placeholder="Email"
                 value={email} onChange={e=>setEmail(e.target.value)} required />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="bg-black text-white px-4 py-2 rounded" type="submit">
            Recevoir le lien
          </button>
        </form>
      )}
    </main>
  )
}
