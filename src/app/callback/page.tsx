"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TrendingUp, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processando sua compra...')

  useEffect(() => {
    processCallback()
  }, [])

  const processCallback = async () => {
    try {
      // Capturar parâmetros da URL (enviados pelo Kirvano)
      const email = searchParams.get('email')
      const productId = searchParams.get('product_id')
      const transactionId = searchParams.get('transaction_id')
      const plan = searchParams.get('plan') || 'monthly'

      if (!email) {
        setStatus('error')
        setMessage('Email não encontrado. Por favor, entre em contato com o suporte.')
        return
      }

      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (!existingUser) {
        // Criar novo usuário na tabela users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            email,
            is_admin: false,
            created_at: new Date().toISOString()
          })

        if (userError) {
          console.error('Erro ao criar usuário:', userError)
          setStatus('error')
          setMessage('Erro ao criar conta. Por favor, entre em contato com o suporte.')
          return
        }
      }

      // Calcular data de expiração baseado no plano
      const now = new Date()
      let endDate = new Date()
      
      switch(plan) {
        case 'monthly':
          endDate.setMonth(now.getMonth() + 1)
          break
        case 'semiannual':
          endDate.setMonth(now.getMonth() + 6)
          break
        case 'annual':
          endDate.setFullYear(now.getFullYear() + 1)
          break
        default:
          endDate.setMonth(now.getMonth() + 1)
      }

      // Criar ou atualizar assinatura
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          email,
          plan,
          status: 'active',
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          transaction_id: transactionId,
          product_id: productId,
          updated_at: now.toISOString()
        }, {
          onConflict: 'email'
        })

      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError)
        setStatus('error')
        setMessage('Erro ao ativar assinatura. Por favor, entre em contato com o suporte.')
        return
      }

      // Sucesso!
      setStatus('success')
      setMessage('Sua conta foi criada com sucesso! Você será redirecionado para fazer login.')
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error) {
      console.error('Erro no callback:', error)
      setStatus('error')
      setMessage('Erro ao processar sua compra. Por favor, entre em contato com o suporte.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              {status === 'processing' && <Loader2 className="w-10 h-10 text-black animate-spin" />}
              {status === 'success' && <CheckCircle className="w-10 h-10 text-black" />}
              {status === 'error' && <AlertCircle className="w-10 h-10 text-black" />}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            CarteiraPro
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            {status === 'processing' && 'Processando sua compra...'}
            {status === 'success' && 'Compra confirmada!'}
            {status === 'error' && 'Erro no processamento'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            status === 'processing' ? 'bg-blue-500/10 border-blue-500/50' :
            status === 'success' ? 'bg-green-500/10 border-green-500/50' :
            'bg-red-500/10 border-red-500/50'
          }`}>
            <p className={`text-center ${
              status === 'processing' ? 'text-blue-400' :
              status === 'success' ? 'text-green-400' :
              'text-red-400'
            }`}>
              {message}
            </p>
          </div>

          {status === 'success' && (
            <div className="space-y-2 text-sm text-gray-400 text-center">
              <p>✅ Conta criada com sucesso</p>
              <p>✅ Assinatura ativada</p>
              <p>✅ Redirecionando para login...</p>
            </div>
          )}

          {status === 'error' && (
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700 font-semibold"
            >
              Ir para Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
