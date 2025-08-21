'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Tree = { id: string; slug: string; name: string }
type Membership = { role: string; status: string }

export default function TreePage(){
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [tree, setTree] = useState<Tree | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(()=> {
    (async()=>{
      // user
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || ''
      setUserId(uid)

      // tree by slug
      const { data: t } = await supabase.from('trees').select('*').eq('slug', slug).single()
      setTree(t || null)

      if (t && uid){
        const { data: m } = await supabase
          .from('memberships')
          .select('role,status')
          .eq('tree_id', t.id)
          .eq('user_id', uid)
          .maybeSingle()
        setMembership(m || null)
      }
    })()
  }, [slug])

  async function requestJoin(){
    if(!tree || !userId) return
    // insert pending membership (RLS permet insert si user_id = auth.uid())
    const { error } = await supabase.from('memberships').insert({
      tree_id: tree.id, user_id: userId, role: 'viewer', status: 'pending'
    })
    if(error) alert(error.message)
    else setMembership({ role: 'viewer', status: 'pending' })
  }

  return (
    <main className="space-y-4">
      {!tree ? <p>Chargement…</p> : (
        <>
          <h1 className="text-2xl font-semibold">{tree.name} <span className="text-gray-500">/{tree.slug}</span></h1>

          {!membership && (
            <button
              onClick={requestJoin}
              className="bg-[color:var(--primary)] text-white px-4 py-2 rounded-xl hover:opacity-90"
            >
              Demander à rejoindre
            </button>
          )}

          {membership && membership.status === 'pending' && (
            <p className="text-gray-600">Votre demande est en attente de validation.</p>
          )}
          {membership && membership.status === 'active' && (
            <p className="text-green-700">Vous êtes membre ({membership.role}).</p>
          )}
        </>
      )}
    </main>
  )
}
