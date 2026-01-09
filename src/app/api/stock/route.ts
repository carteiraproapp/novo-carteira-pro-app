import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { stock, period = '1mo' } = await request.json()

    if (!stock) {
      return NextResponse.json(
        { error: 'Símbolo da ação é obrigatório' },
        { status: 400 }
      )
    }

    const response = await fetch('https://yahoo-finance160.p.rapidapi.com/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'yahoo-finance160.p.rapidapi.com',
        'x-rapidapi-key': '9c864a3a0emsh26d7d2f4fa5385ap15559djsn5142ec7636f4'
      },
      body: JSON.stringify({
        stock: stock.toUpperCase(),
        period
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da ação')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in stock API:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da ação' },
      { status: 500 }
    )
  }
}
