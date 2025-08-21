import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest){
  const hasSession = req.cookies.get('sb-access-token')
  if(req.nextUrl.pathname.startsWith('/app') && !hasSession){
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*'] }
