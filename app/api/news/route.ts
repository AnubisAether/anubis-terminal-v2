import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const res = await fetch(
      'https://finnhub.io/api/v1/news?category=general&minId=0&token=' + FINNHUB_KEY
    )
    const data = await res.json()

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 })
    }

    const articles = data.slice(0, 10).map((item: any) => ({
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      time: new Date(item.datetime * 1000).toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }))

    const headlineList = articles.map((a, i) => i + '. ' + a.headline).join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: 'You are a trading intelligence system analyzing news for NQ, ES, and MGC futures impact.\n\nAnalyze these ' + articles.length + ' news headlines and return ONLY a JSON array with no markdown, no backticks, no explanation. Each item must have:\n- "importance": "RED", "ORANGE", or "YELLOW" (RED=major market moving, ORANGE=moderate impact, YELLOW=minor/irrelevant)\n- "impact": market impact prediction like "+1.2%" or "-0.8%" or "0.0%" for NQ futures\n- "analysis": one sharp sentence on how this affects NQ/ES/MGC\n\nHeadlines:\n' + headlineList + '\n\nReturn only the JSON array, nothing else.'
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    let enriched
    try {
      enriched = JSON.parse(text)
    } catch {
      enriched = articles.map(() => ({ importance: 'YELLOW', impact: '0.0%', analysis: 'Analysis unavailable' }))
    }

    const result = articles.map((a, i) => ({
      ...a,
      importance: enriched[i]?.importance || 'YELLOW',
      impact: enriched[i]?.impact || '0.0%',
      analysis: enriched[i]?.analysis || '',
    }))

    return NextResponse.json({ articles: result, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('News error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}