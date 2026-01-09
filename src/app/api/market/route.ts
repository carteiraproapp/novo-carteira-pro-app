import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      'https://live-stock-market.p.rapidapi.com/v1/index/chart?symbol=%5EGSPC&interval=1d&range=ytd&period1=1399827600&period2=1709176300',
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'live-stock-market.p.rapidapi.com',
          'x-rapidapi-key': '9c864a3a0emsh26d7d2f4fa5385ap15559djsn5142ec7636f4'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
