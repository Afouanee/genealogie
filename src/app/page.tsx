'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Tree = { id: string; slug: string; name: string }

export default function AppHome(){
  const [trees, setTrees] = useState<Tree[]>([])
  useEffect(()=>{ (async()=>{
    const { data, error } = await supabase.from('trees').select('id,slug,name').limit(20)
    if(!error) setTrees(data || [])
  })() },[])

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Mes arbres</h1>
      <ul className="space-y-2">
        {trees.map(t=> (
          <li key={t.id} className="bg-[color:var(--card)] border rounded-2xl p-4">
            <a href={`/app/tree/${t.slug}`} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-gray-500">/{t.slug}</div>
              </div>
              <span className="text-[color:var(--primary)]">Ouvrir →</span>
            </a>
          </li>
        ))}
      </ul>
      <a className="inline-block bg-[color:var(--primary)] text-white px-4 py-2 rounded-xl hover:opacity-90"
         href="/app/new-tree">
        Créer un arbre
      </a>
    </main>
  )
}
