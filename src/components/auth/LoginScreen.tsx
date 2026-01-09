"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

interface LoginScreenProps {
  onLoginSuccess: () => void
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          toast.success("Login realizado com sucesso!")
          onLoginSuccess()
        }
      } else {
        // Cadastro (apenas para usuários que pagaram)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          toast.success("Conta criada! Faça login para continuar.")
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao autenticar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50 mx-auto">
            <TrendingUp className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            CarteiraPro
          </h1>
          <p className="text-gray-400">
            Sua plataforma completa de investimentos
          </p>
        </div>

        {/* Card de Login/Cadastro */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              {isLogin
                ? "Entre com suas credenciais para acessar"
                : "Cadastre-se para começar a investir"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>{isLogin ? "Entrar" : "Criar conta"}</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                {isLogin
                  ? "Não tem uma conta? Cadastre-se"
                  : "Já tem uma conta? Faça login"}
              </button>
            </div>

            {/* Informação sobre pagamento */}
            {!isLogin && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-400/30 rounded-lg">
                <p className="text-xs text-gray-300 text-center">
                  ⚠️ O cadastro só é liberado após a conclusão do pagamento via Kirvano
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Ao fazer login, você concorda com nossos Termos de Uso e Política de Privacidade.
              Seus dados estão protegidos com criptografia de ponta a ponta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
