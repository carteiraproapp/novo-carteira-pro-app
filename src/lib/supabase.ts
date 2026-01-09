import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface UserProfile {
  id: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  email: string
  payment_id: string
  plan_type: string
  status: string
  start_date: string
  end_date: string
  created_at: string
}

// Função para verificar se usuário é admin
export async function isUserAdmin(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return data?.is_admin === true
  } catch (error) {
    console.error('Error in isUserAdmin:', error)
    return false
  }
}

// Função para obter perfil do usuário
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Função para criar assinatura
export async function createSubscription(
  userId: string,
  email: string,
  paymentId: string,
  planType: string,
  durationMonths: number
): Promise<Subscription | null> {
  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + durationMonths)

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        email: email,
        payment_id: paymentId,
        plan_type: planType,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createSubscription:', error)
    return null
  }
}
