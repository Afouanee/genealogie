'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Tree = { id: string; name: string; slug: string }
type MemberRow = { user_id: string; role: string; status: string }

export default function AdminTree(){
  const { slug } = useParams<{ slug: string }>()
  const [tree, setTree] = useState<Tree | null>(null)
  const [pending, setPending] = useState<MemberRow[]>([])
  const [approverId, setApproverId] = useState<string>('')

  useEffect(()=> {
    (async()=>{
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || ''
      setApproverId(uid)

      const { data: t } = await supabase.from('trees').select('*').eq('slug', slug).single()
      setTree(t || null)

      if(t){
        // on liste nos propres memberships par défaut, mais pour admin on veut voir les pending de tout le monde
        // on utilise un RPC côté serveur normalement ; pour MVP, on s’appuie sur l’API approve (server role)
        const { data: rows, error } = await supabase
          .from('memberships')
          .select('user_id, role, status')
          .eq('tree_id', t.id)
          .eq('status', 'pending')
        if(!error) setPending(rows || [])
      }
    })()
  }, [slug])

  async function approve(user_id: string){
    if(!tree || !approverId) return
    const res = await fetch('/api/memberships/approve', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ tree_id: tree.id, target_user_id: user_id, approver_user_id: approverId })
    })
    if(res.ok){
      setPending(p => p.filter(m => m.user_id !== user_id))
      alert('Membre activé')
    } else {
      const j = await res.json()
      alert(j.error || 'Erreur')
    }
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin / {slug}</h1>
      {!tree && <p>Chargement…</p>}
      {tree && (
        <>
          <h2 className="text-xl font-medium">Demandes en attente</h2>
          {pending.length === 0 ? <p>Aucune demande.</p> : (
            <ul className="space-y-2">
              {pending.map(m => (
                <li key={m.user_id} className="bg-[color:var(--card)] border rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">user: {m.user_id}</div>
                    <div className="text-sm">status: {m.status}</div>
                  </div>
                  <button
                    onClick={()=>approve(m.user_id)}
                    className="bg-[color:var(--primary)] text-white px-3 py-2 rounded-xl hover:opacity-90"
                  >
                    Accepter
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}
