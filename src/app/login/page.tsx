"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Fazer login com Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("Email ou senha incorretos. Verifique suas credenciais.")
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("Erro ao fazer login. Tente novamente.")
        setIsLoading(false)
        return
      }

      // Verificar se usuário tem assinatura ativa ou é admin
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
          setError("Sua assinatura expirou ou não foi encontrada. Por favor, renove seu plano.")
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }
      }

      // Login bem-sucedido - redirecionar para o app
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro ao fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              <TrendingUp className="w-10 h-10 text-black" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            CarteiraPro
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            Faça login para acessar sua plataforma de investimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700 font-semibold text-base h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
            <p className="text-center text-sm text-gray-400">
              Comprou mas ainda não criou sua conta?{" "}
              <button
                onClick={() => router.push('/register')}
                className="text-green-400 hover:text-green-300 font-semibold"
              >
                Criar conta agora
              </button>
            </p>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-center text-sm text-gray-400 mb-3">
                Não tem uma conta?{" "}
                <span className="text-green-400 font-semibold">Assine agora</span>
              </p>
              <div className="space-y-2 text-xs text-gray-500 text-center">
                <p className="font-semibold text-gray-400">Planos disponíveis:</p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://pay.kirvano.com/227ebec4-ebf0-4e94-a9ee-8e13f323c3ac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-semibold hover:underline"
                  >
                    📅 Plano Mensal
                  </a>
                  <a
                    href="https://pay.kirvano.com/c27cf3e4-51e9-41df-8101-3988f6073c45"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-semibold hover:underline"
                  >
                    📅 Plano Semestral (Economize!)
                  </a>
                  <a
                    href="https://pay.kirvano.com/351891dd-c61a-42d1-b9ce-90d32f33e246"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-semibold hover:underline"
                  >
                    📅 Plano Anual (Melhor Oferta!)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
