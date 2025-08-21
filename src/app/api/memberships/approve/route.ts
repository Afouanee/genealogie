import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request){
  try{
    const { tree_id, target_user_id, approver_user_id } = await req.json()
    if(!tree_id || !target_user_id || !approver_user_id){
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // vérifier que l'approver est admin/owner de cet arbre
    const { data: approver, error: eCheck } = await admin
      .from('memberships')
      .select('role,status')
      .eq('tree_id', tree_id)
      .eq('user_id', approver_user_id)
      .single()
    if(eCheck || !approver || approver.status !== 'active' || !['owner','admin'].includes(approver.role)){
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    // passer la demande en active (role par défaut: member)
    const { error: eUpd } = await admin
      .from('memberships')
      .update({ status: 'active', role: 'member' })
      .eq('tree_id', tree_id)
      .eq('user_id', target_user_id)

    if(eUpd) return NextResponse.json({ error: eUpd.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }catch(err:any){
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
