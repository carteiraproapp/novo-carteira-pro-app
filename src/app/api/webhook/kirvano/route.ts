import { NextRequest, NextResponse } from 'next/server'
import { supabase, createSubscription } from '@/lib/supabase'

// Mapeamento dos links de pagamento Kirvano para planos
const KIRVANO_PLANS = {
  '227ebec4-ebf0-4e94-a9ee-8e13f323c3ac': {
    name: 'Plano Mensal',
    duration_months: 1,
    type: 'monthly'
  },
  'c27cf3e4-51e9-41df-8101-3988f6073c45': {
    name: 'Plano Semestral',
    duration_months: 6,
    type: 'semester'
  },
  '351891dd-c61a-42d1-b9ce-90d32f33e246': {
    name: 'Plano Anual',
    duration_months: 12,
    type: 'annual'
  }
}

// Webhook para receber notificações de pagamento do Kirvano
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 Webhook Kirvano recebido:', body)
    
    // Validar webhook do Kirvano (se houver assinatura)
    const signature = request.headers.get('x-kirvano-signature')
    const webhookSecret = process.env.KIRVANO_WEBHOOK_SECRET
    
    if (webhookSecret && signature !== webhookSecret) {
      console.error('❌ Assinatura inválida')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    // Extrair dados do pagamento
    const {
      payment_id,
      transaction_id,
      status,
      customer_email,
      customer_name,
      plan_id,
      product_id,
      amount,
      metadata
    } = body

    // Identificar o plano baseado no payment_id ou product_id
    let planInfo = null
    
    // Tentar identificar pelo product_id ou plan_id
    if (product_id && KIRVANO_PLANS[product_id as keyof typeof KIRVANO_PLANS]) {
      planInfo = KIRVANO_PLANS[product_id as keyof typeof KIRVANO_PLANS]
    } else if (plan_id && KIRVANO_PLANS[plan_id as keyof typeof KIRVANO_PLANS]) {
      planInfo = KIRVANO_PLANS[plan_id as keyof typeof KIRVANO_PLANS]
    } else {
      // Plano padrão se não identificar
      planInfo = KIRVANO_PLANS['227ebec4-ebf0-4e94-a9ee-8e13f323c3ac']
    }

    console.log('📦 Plano identificado:', planInfo)

    // Se pagamento foi aprovado/pago
    if (status === 'approved' || status === 'paid' || status === 'completed') {
      console.log('✅ Pagamento aprovado, criando usuário...')
      
      // Gerar senha temporária forte
      const tempPassword = generateSecurePassword()
      
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const userExists = existingUser?.users.find(u => u.email === customer_email)

      let userId: string

      if (userExists) {
        console.log('👤 Usuário já existe, atualizando assinatura...')
        userId = userExists.id
      } else {
        console.log('🆕 Criando novo usuário...')
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: customer_email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: customer_name || customer_email.split('@')[0],
            plan_type: planInfo.type
          }
        })

        if (authError) {
          console.error('❌ Erro ao criar usuário:', authError)
          return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
        }

        if (!authData.user) {
          console.error('❌ Usuário não foi criado')
          return NextResponse.json({ error: 'Usuário não criado' }, { status: 500 })
        }

        userId = authData.user.id

        // Criar registro na tabela users
        await supabase
          .from('users')
          .insert({
            id: userId,
            email: customer_email,
            is_admin: false
          })

        console.log('✅ Usuário criado com sucesso:', userId)
      }

      // Criar ou atualizar assinatura
      const subscriptionData = await createSubscription(
        userId,
        customer_email,
        payment_id || transaction_id || `kirvano_${Date.now()}`,
        planInfo.type,
        planInfo.duration_months
      )

      console.log('✅ Assinatura criada:', subscriptionData)

      // URL do app para redirecionamento
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://carteiraproapp.com'

      // Preparar dados para envio de email
      const emailData = {
        email: customer_email,
        name: customer_name || customer_email.split('@')[0],
        password: userExists ? null : tempPassword,
        plan: planInfo.name,
        app_url: appUrl,
        login_url: `${appUrl}/login`
      }

      // TODO: Enviar email com credenciais
      // await sendWelcomeEmail(emailData)
      
      console.log('📧 Credenciais (envie por email):', {
        email: customer_email,
        senha: userExists ? 'Usuário já existe - use senha anterior' : tempPassword,
        plano: planInfo.name,
        url_login: emailData.login_url
      })

      // Retornar resposta com URL de redirecionamento
      return NextResponse.json({ 
        success: true, 
        message: 'Assinatura criada com sucesso',
        user_id: userId,
        plan: planInfo.name,
        redirect_url: `${appUrl}/login?welcome=true&email=${encodeURIComponent(customer_email)}`,
        credentials: {
          email: customer_email,
          password: userExists ? null : tempPassword,
          login_url: emailData.login_url
        }
      })
    }

    // Outros status (pending, failed, etc)
    console.log('⏳ Pagamento com status:', status)
    return NextResponse.json({ 
      success: false, 
      message: `Pagamento com status: ${status}` 
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Gerar senha segura
function generateSecurePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  let password = ''
  
  // Garantir pelo menos 1 de cada tipo
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%&*'[Math.floor(Math.random() * 7)]
  
  // Preencher o resto
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Permitir GET para testar se webhook está ativo
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook Kirvano está funcionando',
    plans: KIRVANO_PLANS,
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'https://carteiraproapp.com'
  })
}
