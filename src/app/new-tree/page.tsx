'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function NewTree(){
  const [slug,setSlug]=useState('pondy')
  const [name,setName]=useState('Pondy')
  const [userId,setUserId]=useState<string>('')

  useEffect(()=>{ supabase.auth.getUser().then(({data})=> setUserId(data.user?.id||'')) },[])

  async function createTree(e:React.FormEvent){
    e.preventDefault()
    const res = await fetch('/api/trees', {
      method:'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ slug, name, user_id: userId })
    })
    if(res.ok) window.location.href = `/app/tree/${slug}`
    else alert('Erreur création arbre')
  }

  return (
    <main className="max-w-sm mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Créer un arbre</h1>
      <form onSubmit={createTree} className="space-y-3">
        <input className="border p-2 w-full rounded-xl" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="slug (ex: pondy)"/>
        <input className="border p-2 w-full rounded-xl" value={name} onChange={e=>setName(e.target.value)} placeholder="Nom"/>
        <button className="bg-[color:var(--primary)] text-white px-4 py-2 rounded-xl hover:opacity-90">Créer</button>
      </form>
    </main>
  )
}
