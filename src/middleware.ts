import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sessão do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Páginas públicas (não requerem autenticação)
  const publicPaths = ['/login', '/api/webhook']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Se não está logado e tentando acessar página protegida
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está logado e tentando acessar login, redirecionar para home
  if (session && req.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está logado, verificar assinatura ativa (exceto para admin)
  if (session && !isPublicPath) {
    const email = session.user.email

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', email)
      .single()

    const isAdmin = userData?.is_admin === true

    if (!isAdmin) {
      // Verificar assinatura ativa
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .single()

      if (!subscription) {
        // Assinatura expirada - fazer logout e redirecionar
        await supabase.auth.signOut()
        const redirectUrl = new URL('/login', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
