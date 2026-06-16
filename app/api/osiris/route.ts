import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prices } = await request.json()

    const priceContext = prices.map((p: any) =>
      `${p.symbol}: $${p.price.toLocaleString()} (${p.change >= 0 ? '+' : ''}${p.change.toFixed(2)}, ${p.percent >= 0 ? '+' : ''}${p.percent.toFixed(2)}%)`
    ).join(' | ')

    const now = new Date()
    const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const hour = est.getHours()
    const minute = est.getMinutes()
    const timeStr = `${hour}:${minute.toString().padStart(2, '0')} EST`

    let sessionWindow = ''
    const time = hour * 60 + minute
    if (time >= 570 && time < 600) sessionWindow = 'NY OPEN — first 30 minutes, highest volatility, ORH/ORL forming'
    else if (time >= 600 && time < 660) sessionWindow = 'PRIME WINDOW 9:30-11:00 AM — cleanest order flow, best SCT setups'
    else if (time >= 660 && time < 750) sessionWindow = 'POST-PRIME 11:00 AM — momentum exhausting, reduce size'
    else if (time >= 750 && time < 870) sessionWindow = 'LUNCH DEAD ZONE 12:30 PM — DO NOT TRADE, volume drops, levels fading'
    else if (time >= 870 && time < 960) sessionWindow = 'AFTERNOON 2:00-3:45 PM — erratic position squaring, high risk'
    else if (time >= 120 && time < 300) sessionWindow = 'LONDON SESSION — manipulation likely, liquidity sweeps, be cautious'
    else sessionWindow = 'OVERNIGHT/ASIA — thin volume, extended hours, lower conviction'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are OSIRIS — sovereign trading intelligence for an NQ futures scalper using Session Confluence Trading (SCT).

Current time: ${timeStr}
Session window: ${sessionWindow}
Live prices: ${priceContext}

SCT Framework context:
- Trade ONLY at key levels: POC, VAH, VAL, VWAP, 2nd/3rd std dev bands, ORH/ORL
- Confirmation stack required: EMA alignment + order flow (delta/CVD/heatmap) + ABSORPTION (mandatory)
- Best window: 9:30-11:00 AM EST. Avoid: 11 AM-12:30 PM (lunch) and 2-3:45 PM (close)
- Hard stop max: 25 NQ points. Minimum 1:3 R:R. 1% account risk max.
- MGC spike = risk-off = watch NQ for reversal. NQ/ES divergence = warning signal.
- Above VWAP = long bias. Below VWAP = short bias. 2nd/3rd band = snap-back in play.
- NQ point value: $20/contract. Every 1 point = $20.

Generate exactly 6 sharp tactical observations — 2 for NQ, 2 for ES, 2 for MGC.
Each line must be specific, actionable, and reference SCT concepts (levels, bias, order flow, session context).
Under 90 characters each. No bullet points. No numbers. No generic commentary.
Format: alternate NQ/ES/MGC — line 1 NQ, line 2 ES, line 3 MGC, line 4 NQ, line 5 ES, line 6 MGC.`
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