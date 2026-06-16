import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prices } = await request.json()

    const priceContext = prices.map((p: any) =>
      `${p.symbol}: $${p.price.toLocaleString()} (${p.change >= 0 ? '+' : ''}${p.change.toFixed(2)}, ${p.percent.toFixed(2)}%)`
    ).join(' | ')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are OSIRIS, a sovereign trading intelligence agent monitoring NQ, ES, and MGC futures. 
          
Current market data: ${priceContext}

Generate 6 short, sharp intelligence observations about current market conditions. Each line should be a distinct insight — momentum, structure, correlation, risk, or session context. Be direct and tactical. No fluff. Format as exactly 6 lines, each under 80 characters. No bullet points or numbers.`
        }
      ]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const lines = text.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 6)

    return NextResponse.json({ lines, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('OSIRIS error:', error)
    return NextResponse.json({ error: 'OSIRIS offline' }, { status: 500 })
  }
}