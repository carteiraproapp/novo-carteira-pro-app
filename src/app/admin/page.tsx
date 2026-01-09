"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isUserAdmin } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, TrendingUp, DollarSign, Activity, LogOut, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminStats {
  totalUsers: number
  totalInvestments: number
  totalRevenue: number
  activeUsers: number
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvestments: 0,
    totalRevenue: 0,
    activeUsers: 0
  })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUserEmail(user.email || "")

      // Verificar se é admin
      const adminStatus = await isUserAdmin(user.email || "")
      
      if (!adminStatus) {
        router.push("/")
        return
      }

      setIsAdmin(true)
      await loadAdminStats()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadAdminStats = async () => {
    try {
      // Buscar estatísticas do banco
      const { data: users, error } = await supabase
        .from('users')
        .select('*')

      if (error) throw error

      setStats({
        totalUsers: users?.length || 0,
        totalInvestments: 1247, // Mock data - integrar com tabela de investimentos
        totalRevenue: 524800,
        activeUsers: users?.filter(u => u.is_admin === false).length || 0
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-lg">Verificando permissões...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Lock className="w-6 h-6" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Você não tem permissões de administrador para acessar esta página.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-black"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                Painel de Administração
              </h1>
              <p className="text-xs text-gray-400">CarteiraPro Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-400/50">
              Admin: {userEmail}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6 bg-green-500/10 border-green-400/50">
          <Shield className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            Você está acessando o painel administrativo com permissões completas.
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Usuários
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-green-400">
                {stats.totalUsers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">+12 novos esta semana</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Investimentos Ativos
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-400">
                {stats.totalInvestments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">+8.5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Receita Total
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-green-300">
                ${stats.totalRevenue.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">+15.2% crescimento</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Usuários Ativos
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-400">
                {stats.activeUsers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Online nas últimas 24h</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Ações Administrativas
            </CardTitle>
            <CardDescription>Gerencie usuários, investimentos e configurações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 border-gray-700 hover:border-green-400/50 hover:bg-green-500/10"
              >
                <Users className="w-6 h-6 text-green-400 mb-2" />
                <span className="font-semibold text-white">Gerenciar Usuários</span>
                <span className="text-xs text-gray-400">Ver, editar e remover usuários</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 border-gray-700 hover:border-green-400/50 hover:bg-green-500/10"
              >
                <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                <span className="font-semibold text-white">Análise de Investimentos</span>
                <span className="text-xs text-gray-400">Relatórios e estatísticas</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 border-gray-700 hover:border-green-400/50 hover:bg-green-500/10"
              >
                <Activity className="w-6 h-6 text-green-400 mb-2" />
                <span className="font-semibold text-white">Monitorar Sistema</span>
                <span className="text-xs text-gray-400">Performance e logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Novo usuário cadastrado", user: "maria@email.com", time: "5 min atrás" },
                { action: "Investimento realizado", user: "joao@email.com", time: "15 min atrás" },
                { action: "Perfil atualizado", user: "ana@email.com", time: "1h atrás" }
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-gray-800">
                  <div>
                    <p className="font-medium text-white">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
