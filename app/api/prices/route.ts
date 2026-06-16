import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const symbols = ['NQ=F', 'ES=F', 'GC=F']
    const displayNames = ['NQ', 'ES', 'MGC']

    const responses = await Promise.all(
      symbols.map(symbol =>
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + symbol + '?interval=1m&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json())
      )
    )

    const prices = responses.map((data, i) => {
      const meta = data?.chart?.result?.[0]?.meta || {}
      const price = meta.regularMarketPrice || 0
      const prev = meta.previousClose || 0
      return {
        symbol: displayNames[i],
        price,
        change: price - prev,
        percent: prev ? ((price - prev) / prev) * 100 : 0,
        high: meta.regularMarketDayHigh || 0,
        low: meta.regularMarketDayLow || 0,
        volume: meta.regularMarketVolume || 0,
      }
    })

    return NextResponse.json({ prices, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
