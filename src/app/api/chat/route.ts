import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Verifica se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          response: 'Para usar o Chat IA, você precisa configurar a variável de ambiente OPENAI_API_KEY. Clique no banner laranja acima para adicionar sua chave da OpenAI.' 
        },
        { status: 200 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente financeiro especializado em investimentos, mercado de ações, fundos imobiliários, renda fixa e criptomoedas. 
          Seu objetivo é ajudar usuários a entenderem melhor o mercado financeiro brasileiro e tomar decisões informadas sobre investimentos.
          Seja claro, objetivo e sempre mencione que suas respostas não são recomendações de investimento, apenas informações educacionais.
          Contexto: ${context || 'investimentos e mercado financeiro'}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Error in chat API:', error)
    
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          response: 'Sua chave da OpenAI está inválida ou expirada. Clique no banner laranja acima para atualizar sua chave.' 
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}
