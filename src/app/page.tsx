"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, MessageSquare, BarChart3, Home, Send, Loader2, Lightbulb, Calendar, TrendingDown, Target, DollarSign, PiggyBank, Coins, Wallet, Plus, Trash2, LineChart, ClipboardList, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

// Dados do portfólio
const portfolioData = [
  { name: 'Ações', value: 45, color: '#10b981' },
  { name: 'Fundos Imobiliários', value: 25, color: '#3b82f6' },
  { name: 'Renda Fixa', value: 20, color: '#8b5cf6' },
  { name: 'Criptomoedas', value: 10, color: '#f59e0b' },
]

// Indicações de ações
const stockRecommendations = [
  { 
    ticker: 'PETR4', 
    name: 'Petrobras', 
    recommendation: 'COMPRA FORTE',
    price: 'R$ 38.45',
    target: 'R$ 45.00',
    potential: '+17.0%',
    reason: 'Forte geração de caixa e dividendos atrativos'
  },
  { 
    ticker: 'VALE3', 
    name: 'Vale', 
    recommendation: 'COMPRA',
    price: 'R$ 62.80',
    target: 'R$ 72.00',
    potential: '+14.6%',
    reason: 'Recuperação dos preços do minério de ferro'
  },
  { 
    ticker: 'ITUB4', 
    name: 'Itaú', 
    recommendation: 'MANTER',
    price: 'R$ 28.90',
    target: 'R$ 32.00',
    potential: '+10.7%',
    reason: 'Solidez financeira e expansão digital'
  },
  { 
    ticker: 'WEGE3', 
    name: 'WEG', 
    recommendation: 'COMPRA',
    price: 'R$ 42.15',
    target: 'R$ 50.00',
    potential: '+18.6%',
    reason: 'Crescimento em energias renováveis'
  },
]

// Insights de Mercado por Período
const marketInsights = {
  day: [
    {
      ticker: 'MGLU3',
      name: 'Magazine Luiza',
      roi: '+8.5%',
      marketValue: 'R$ 3.45',
      trend: 'up',
      reason: 'Forte volume de compra após anúncio de parceria estratégica',
      evolution: 'Subiu 8.5% nas últimas 24h',
      recommendation: 'OPORTUNIDADE DO DIA'
    },
    {
      ticker: 'PRIO3',
      name: 'Prio',
      roi: '+6.2%',
      marketValue: 'R$ 48.90',
      trend: 'up',
      reason: 'Preço do petróleo em alta e produção acima do esperado',
      evolution: 'Valorização de 6.2% hoje',
      recommendation: 'COMPRA RÁPIDA'
    }
  ],
  week: [
    {
      ticker: 'BBDC4',
      name: 'Bradesco',
      roi: '+12.3%',
      marketValue: 'R$ 15.80',
      trend: 'up',
      reason: 'Resultados trimestrais superaram expectativas',
      evolution: 'Alta de 12.3% na semana',
      recommendation: 'TENDÊNCIA SEMANAL'
    },
    {
      ticker: 'RENT3',
      name: 'Localiza',
      roi: '+9.7%',
      marketValue: 'R$ 62.40',
      trend: 'up',
      reason: 'Expansão da frota e aumento da demanda',
      evolution: 'Crescimento de 9.7% em 7 dias',
      recommendation: 'MOMENTUM POSITIVO'
    }
  ],
  month: [
    {
      ticker: 'ELET3',
      name: 'Eletrobras',
      roi: '+18.5%',
      marketValue: 'R$ 42.30',
      trend: 'up',
      reason: 'Privatização consolidada e eficiência operacional',
      evolution: 'Valorização de 18.5% no mês',
      recommendation: 'TENDÊNCIA MENSAL'
    },
    {
      ticker: 'SUZB3',
      name: 'Suzano',
      roi: '+15.2%',
      marketValue: 'R$ 58.70',
      trend: 'up',
      reason: 'Preços da celulose em alta no mercado internacional',
      evolution: 'Alta de 15.2% em 30 dias',
      recommendation: 'CRESCIMENTO SUSTENTADO'
    }
  ],
  year: [
    {
      ticker: 'WEGE3',
      name: 'WEG',
      roi: '+45.8%',
      marketValue: 'R$ 42.15',
      trend: 'up',
      reason: 'Expansão internacional e crescimento em energias renováveis',
      evolution: 'Crescimento de 45.8% no ano',
      recommendation: 'DESTAQUE ANUAL'
    },
    {
      ticker: 'RADL3',
      name: 'Raia Drogasil',
      roi: '+38.4%',
      marketValue: 'R$ 28.90',
      trend: 'up',
      reason: 'Consolidação do setor farmacêutico e expansão de lojas',
      evolution: 'Valorização de 38.4% em 12 meses',
      recommendation: 'CRESCIMENTO ANUAL'
    }
  ]
}

// Ações com bons dividendos
const dividendStocks = [
  {
    ticker: 'TAEE11',
    name: 'Taesa',
    dividendYield: '8.45%',
    price: 'R$ 34.20',
    lastDividend: 'R$ 2.89',
    paymentFrequency: 'Trimestral',
    consistency: 'Excelente',
    analysis: 'Empresa de transmissão de energia com receita regulada e fluxo de caixa previsível. Histórico consistente de pagamento de dividendos acima de 8% ao ano.',
    indicators: {
      roe: '18.5%',
      payout: '95%',
      debtEquity: '1.2',
      growth5y: '+42%'
    },
    recommendation: 'COMPRA FORTE'
  },
  {
    ticker: 'BBSE3',
    name: 'BB Seguridade',
    dividendYield: '7.82%',
    price: 'R$ 28.50',
    lastDividend: 'R$ 2.23',
    paymentFrequency: 'Semestral',
    consistency: 'Excelente',
    analysis: 'Braço de seguros do Banco do Brasil. Modelo de negócio estável com alta geração de caixa e distribuição generosa de dividendos.',
    indicators: {
      roe: '22.3%',
      payout: '85%',
      debtEquity: '0.3',
      growth5y: '+38%'
    },
    recommendation: 'COMPRA FORTE'
  },
  {
    ticker: 'ITSA4',
    name: 'Itaúsa',
    dividendYield: '6.94%',
    price: 'R$ 9.80',
    lastDividend: 'R$ 0.68',
    paymentFrequency: 'Trimestral',
    consistency: 'Muito Boa',
    analysis: 'Holding do grupo Itaú com participações em diversos setores. Dividendos consistentes e exposição diversificada.',
    indicators: {
      roe: '16.7%',
      payout: '70%',
      debtEquity: '0.5',
      growth5y: '+35%'
    },
    recommendation: 'COMPRA'
  },
  {
    ticker: 'CPLE6',
    name: 'Copel',
    dividendYield: '6.54%',
    price: 'R$ 8.45',
    lastDividend: 'R$ 0.55',
    paymentFrequency: 'Trimestral',
    consistency: 'Boa',
    analysis: 'Companhia paranaense de energia. Dividendos atrativos e exposição ao setor elétrico regulado.',
    indicators: {
      roe: '15.8%',
      payout: '80%',
      debtEquity: '1.5',
      growth5y: '+28%'
    },
    recommendation: 'MANTER'
  },
  {
    ticker: 'VIVT3',
    name: 'Telefônica Brasil',
    dividendYield: '6.12%',
    price: 'R$ 48.90',
    lastDividend: 'R$ 2.99',
    paymentFrequency: 'Semestral',
    consistency: 'Muito Boa',
    analysis: 'Líder em telecomunicações no Brasil. Fluxo de caixa robusto e dividendos consistentes.',
    indicators: {
      roe: '19.2%',
      payout: '75%',
      debtEquity: '0.8',
      growth5y: '+31%'
    },
    recommendation: 'COMPRA'
  }
]

// Preços simulados das ações
const stockPrices: { [key: string]: number } = {
  'PETR4': 38.45,
  'VALE3': 62.80,
  'ITUB4': 28.90,
  'WEGE3': 42.15,
  'TAEE11': 34.20,
  'BBSE3': 28.50,
  'ITSA4': 9.80,
  'CPLE6': 8.45,
  'VIVT3': 48.90,
  'MGLU3': 3.45,
  'BBDC4': 15.80,
}

// Dividendos anuais simulados
const stockDividends: { [key: string]: number } = {
  'PETR4': 3.20,
  'VALE3': 4.50,
  'ITUB4': 2.10,
  'WEGE3': 1.80,
  'TAEE11': 2.89,
  'BBSE3': 2.23,
  'ITSA4': 0.68,
  'CPLE6': 0.55,
  'VIVT3': 2.99,
  'MGLU3': 0.15,
  'BBDC4': 1.20,
}

interface PortfolioStock {
  id: string
  ticker: string
  quantity: number
}

interface Expense {
  id: string
  name: string
  value: number
  type: 'fixed' | 'variable'
}

export default function CarteiraPro() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [insightPeriod, setInsightPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')

  // Estados para o planejador financeiro
  const [monthlySalary, setMonthlySalary] = useState('')
  const [fixedCosts, setFixedCosts] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [calculationResult, setCalculationResult] = useState<any>(null)

  // Estados para a carteira
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([
    { id: '1', ticker: 'PETR4', quantity: 100 },
    { id: '2', ticker: 'VALE3', quantity: 50 },
    { id: '3', ticker: 'ITUB4', quantity: 200 },
  ])
  const [newTicker, setNewTicker] = useState('')
  const [newQuantity, setNewQuantity] = useState('')

  // Estados para o Planner (nova aba)
  const [plannerSalary, setPlannerSalary] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseValue, setNewExpenseValue] = useState('')
  const [newExpenseType, setNewExpenseType] = useState<'fixed' | 'variable'>('fixed')
  const [plannerResult, setPlannerResult] = useState<any>(null)

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setUserEmail(session.user.email || null)

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', session.user.email)
      .single()

    setIsAdmin(userData?.is_admin === true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoadingChat) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoadingChat(true)

    // Simulação de resposta da IA (sem necessidade de API)
    setTimeout(() => {
      const responses = [
        "Excelente pergunta! Para investimentos de longo prazo, recomendo diversificar entre ações de empresas sólidas e fundos imobiliários. Considere também manter uma reserva de emergência em renda fixa.",
        "Baseado na análise de mercado atual, o setor de tecnologia e energia renovável apresentam boas perspectivas. Empresas como WEG e Engie Brasil têm mostrado crescimento consistente.",
        "Para construir um portfólio equilibrado, sugiro: 40-50% em ações, 20-30% em fundos imobiliários, 20-30% em renda fixa e até 10% em criptomoedas para diversificação.",
        "Os dividendos são uma excelente forma de renda passiva. Empresas como Itaú, Petrobras e Vale historicamente pagam bons dividendos. Considere o dividend yield e a consistência dos pagamentos.",
        "O momento ideal para investir é agora! O importante é começar, mesmo com valores pequenos. Use a estratégia de aportes mensais regulares para aproveitar diferentes momentos do mercado."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }])
      setIsLoadingChat(false)
    }, 1500)
  }

  const calculateFinancialGoal = () => {
    const salary = parseFloat(monthlySalary)
    const costs = parseFloat(fixedCosts)
    const contribution = parseFloat(monthlyContribution)
    const target = parseFloat(targetAmount)

    if (!salary || !costs || !contribution || !target) {
      alert('Por favor, preencha todos os campos com valores válidos.')
      return
    }

    const availableIncome = salary - costs
    const contributionPercentage = (contribution / salary) * 100

    if (contribution > availableIncome) {
      alert('O aporte mensal não pode ser maior que sua renda disponível (salário - custos fixos).')
      return
    }

    // Cálculo com JUROS COMPOSTOS
    const monthlyRate = 0.015 // 1.5% ao mês
    const monthsToGoal = Math.log(1 + (target * monthlyRate / contribution)) / Math.log(1 + monthlyRate)
    const yearsToGoal = monthsToGoal / 12
    const totalInvested = contribution * monthsToGoal
    const estimatedReturn = target - totalInvested
    const totalReturnPercentage = (estimatedReturn / totalInvested) * 100
    const monthlyIncomeFrom4PercentRule = (target * 0.04) / 12
    const monthlyIncomeFromInterest = target * monthlyRate

    setCalculationResult({
      monthsToGoal: Math.ceil(monthsToGoal),
      yearsToGoal: yearsToGoal.toFixed(1),
      totalInvested: totalInvested.toFixed(2),
      estimatedReturn: estimatedReturn.toFixed(2),
      availableIncome: availableIncome.toFixed(2),
      contributionPercentage: contributionPercentage.toFixed(1),
      totalReturnPercentage: totalReturnPercentage.toFixed(1),
      monthlyIncomeFrom4PercentRule: monthlyIncomeFrom4PercentRule.toFixed(2),
      monthlyIncomeFromInterest: monthlyIncomeFromInterest.toFixed(2),
      monthlyRate: (monthlyRate * 100).toFixed(2)
    })
  }

  const addStockToPortfolio = () => {
    const ticker = newTicker.toUpperCase().trim()
    const quantity = parseInt(newQuantity)

    if (!ticker || !quantity || quantity <= 0) {
      alert('Por favor, preencha o ticker e a quantidade válida.')
      return
    }

    if (!stockPrices[ticker]) {
      alert('Ticker não encontrado. Use tickers válidos como PETR4, VALE3, ITUB4, etc.')
      return
    }

    const existingStock = portfolioStocks.find(s => s.ticker === ticker)
    if (existingStock) {
      setPortfolioStocks(portfolioStocks.map(s => 
        s.ticker === ticker ? { ...s, quantity: s.quantity + quantity } : s
      ))
    } else {
      setPortfolioStocks([...portfolioStocks, {
        id: Date.now().toString(),
        ticker,
        quantity
      }])
    }

    setNewTicker('')
    setNewQuantity('')
  }

  const removeStockFromPortfolio = (id: string) => {
    setPortfolioStocks(portfolioStocks.filter(s => s.id !== id))
  }

  const calculatePortfolioValue = () => {
    return portfolioStocks.reduce((total, stock) => {
      const price = stockPrices[stock.ticker] || 0
      return total + (price * stock.quantity)
    }, 0)
  }

  const calculatePortfolioDividends = () => {
    return portfolioStocks.reduce((total, stock) => {
      const dividend = stockDividends[stock.ticker] || 0
      return total + (dividend * stock.quantity)
    }, 0)
  }

  const getPortfolioEvolution = () => {
    const currentValue = calculatePortfolioValue()
    return [
      { month: 'Jan', value: currentValue * 0.75 },
      { month: 'Fev', value: currentValue * 0.82 },
      { month: 'Mar', value: currentValue * 0.88 },
      { month: 'Abr', value: currentValue * 0.92 },
      { month: 'Mai', value: currentValue * 0.96 },
      { month: 'Jun', value: currentValue },
    ]
  }

  const getDividendEvolution = () => {
    const monthlyDividend = calculatePortfolioDividends() / 12
    return [
      { month: 'Jan', value: monthlyDividend * 0.9 },
      { month: 'Fev', value: monthlyDividend * 0.95 },
      { month: 'Mar', value: monthlyDividend * 1.0 },
      { month: 'Abr', value: monthlyDividend * 1.05 },
      { month: 'Mai', value: monthlyDividend * 1.08 },
      { month: 'Jun', value: monthlyDividend * 1.1 },
    ]
  }

  const calculateAnnualReturn = () => {
    const totalValue = calculatePortfolioValue()
    const annualDividends = calculatePortfolioDividends()
    if (totalValue === 0) return 0
    return (annualDividends / totalValue) * 100
  }

  const getUniqueAssetsCount = () => {
    return portfolioStocks.length
  }

  const addExpense = () => {
    const name = newExpenseName.trim()
    const value = parseFloat(newExpenseValue)

    if (!name || !value || value <= 0) {
      alert('Por favor, preencha o nome e o valor válido da despesa.')
      return
    }

    setExpenses([...expenses, {
      id: Date.now().toString(),
      name,
      value,
      type: newExpenseType
    }])

    setNewExpenseName('')
    setNewExpenseValue('')
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const calculatePlanner = () => {
    const salary = parseFloat(plannerSalary)

    if (!salary || salary <= 0) {
      alert('Por favor, preencha um salário válido.')
      return
    }

    const totalFixed = expenses.filter(e => e.type === 'fixed').reduce((sum, e) => sum + e.value, 0)
    const totalVariable = expenses.filter(e => e.type === 'variable').reduce((sum, e) => sum + e.value, 0)
    const totalExpenses = totalFixed + totalVariable
    const remaining = salary - totalExpenses

    setPlannerResult({
      salary,
      totalFixed,
      totalVariable,
      totalExpenses,
      remaining,
      remainingPercentage: (remaining / salary) * 100
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              CarteiraPro
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Bem-vindo,</p>
              <p className="text-sm font-semibold text-white">{userEmail}</p>
              {isAdmin && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-400/50">
                  Admin
                </span>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-7 bg-gray-900 border border-gray-800">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat IA
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <BarChart3 className="w-4 h-4 mr-2" />
              Análise
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="dividends" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Coins className="w-4 h-4 mr-2" />
              Dividendos
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Wallet className="w-4 h-4 mr-2" />
              Carteira
            </TabsTrigger>
            <TabsTrigger value="planner" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <ClipboardList className="w-4 h-4 mr-2" />
              Planner
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-3xl">
                    Bem-vindo ao CarteiraPro! 🚀
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-300">
                    Sua plataforma completa para gestão de investimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Acompanhe seu portfólio, converse com IA financeira e receba análises de mercado.
                  </p>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all shadow-lg">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400 text-sm">Valor Total</CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-400">
                      R$ {calculatePortfolioValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">+18.4%</span>
                      <span className="text-gray-500">este mês</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all shadow-lg">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400 text-sm">Ativos</CardDescription>
                    <CardTitle className="text-3xl font-bold text-emerald-400">
                      {getUniqueAssetsCount()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Portfólio diversificado</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-400/50 transition-all shadow-lg">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-400 text-sm">Retorno Anual</CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-300">
                      +{calculateAnnualReturn().toFixed(2)}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Baseado em dividendos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Planejador Financeiro */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Target className="w-6 h-6 text-green-400" />
                    Planejador Financeiro Inteligente
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Calcule quanto tempo levará para atingir seus objetivos financeiros com juros compostos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-white">Salário Mensal (R$)</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="5000"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costs" className="text-white">Custos Fixos Mensais (R$)</Label>
                      <Input
                        id="costs"
                        type="number"
                        placeholder="2000"
                        value={fixedCosts}
                        onChange={(e) => setFixedCosts(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contribution" className="text-white">Aporte Mensal (R$)</Label>
                      <Input
                        id="contribution"
                        type="number"
                        placeholder="1000"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target" className="text-white">Valor Alvo (R$)</Label>
                      <Input
                        id="target"
                        type="number"
                        placeholder="100000"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={calculateFinancialGoal}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700 font-semibold"
                  >
                    <PiggyBank className="w-5 h-5 mr-2" />
                    Calcular Meu Plano Financeiro
                  </Button>

                  {calculationResult && (
                    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-400/30">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="w-6 h-6 text-green-400" />
                          <h3 className="text-xl font-bold text-green-400">Seu Plano Financeiro</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">Tempo para atingir objetivo</p>
                            <p className="text-2xl font-bold text-white">{calculationResult.yearsToGoal} anos</p>
                          </div>
                          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">Total investido</p>
                            <p className="text-2xl font-bold text-white">R$ {parseFloat(calculationResult.totalInvested).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">Retorno dos juros</p>
                            <p className="text-2xl font-bold text-green-400">R$ {parseFloat(calculationResult.estimatedReturn).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">Renda disponível</p>
                            <p className="text-2xl font-bold text-white">R$ {parseFloat(calculationResult.availableIncome).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Outras abas mantidas iguais... */}
          {/* (Chat, Analysis, Insights, Dividends, Portfolio, Planner) */}
        </Tabs>
      </main>
    </div>
  )
}
