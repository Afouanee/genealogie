import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request){
  try {
    const body = await req.json()
    const { slug, name, user_id } = body

    if(!slug || !name || !user_id){
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // client admin côté serveur (OK: variable non NEXT_PUBLIC)
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1) créer l'arbre
    const { data: tree, error: e1 } = await admin.from('trees')
      .insert({ slug, name, created_by: user_id })
      .select()
      .single()
    if(e1) return NextResponse.json({ error: e1.message }, { status: 400 })

    // 2) membership owner actif
    const { error: e2 } = await admin.from('memberships')
      .insert({ tree_id: tree.id, user_id, role:'owner', status:'active' })
    if(e2) return NextResponse.json({ error: e2.message }, { status: 400 })

    return NextResponse.json({ ok:true, tree })
  } catch (err:any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
