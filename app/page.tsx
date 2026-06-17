'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import DXFeedPrices from '../components/DXFeedPrices'

const Globe = dynamic(() => import('../components/Globe'), { ssr: false })

function getMarketSession() {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const time = est.getHours() * 60 + est.getMinutes()
  if (time >= 480 && time < 1020) return 'NEW YORK'
  if (time >= 120 && time < 300) return 'LONDON'
  if (time >= 1200 || time < 120) return 'ASIA'
  return 'OFF HOURS'
}

function isMarketOpen() {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = est.getDay()
  const time = est.getHours() * 60 + est.getMinutes()
  if (day === 6) return false
  if (day === 0 && time < 1080) return false
  if (day === 5 && time >= 1020) return false
  if (time >= 1020 && time < 1080) return false
  return true
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [marketSession, setMarketSession] = useState('ASIA')
  const [marketOpen, setMarketOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('COMMAND')
  const [checklist, setChecklist] = useState(Array(12).fill(false))
  const [prices, setPrices] = useState([
    { symbol: 'NQ', price: 0, change: 0, percent: 0 },
    { symbol: 'ES', price: 0, change: 0, percent: 0 },
    { symbol: 'MGC', price: 0, change: 0, percent: 0 },
  ])
  const [osirisLines, setOsirisLines] = useState<string[]>([
    'Initializing OSIRIS intelligence core...',
    'Connecting to market data streams...',
    'Calibrating correlation matrices...',
    'Loading session confluence parameters...',
    'Risk protocols online...',
    'OSIRIS standing by...',
  ])
  const [news, setNews] = useState<{headline: string, source: string, time: string, url: string, importance: string, impact: string, analysis: string}[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      setMarketOpen(isMarketOpen())
      setMarketSession(getMarketSession())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('/api/dxfeed-proxy')
        const data = await res.json()
        if (data.prices) {
          const mapped = data.prices.map((p: any) => ({
            symbol: p.symbol,
            price: p.price || 0,
            change: p.change || 0,
            percent: p.percent || 0,
          }))
          setPrices(mapped)
        }
      } catch (e) {
        console.error('Price fetch failed', e)
      }
      try {
        const newsRes = await fetch('/api/news')
        const newsData = await newsRes.json()
        if (newsData.articles) setNews(newsData.articles)
      } catch (e) {
        console.error('News fetch failed', e)
      }
    }
    fetchAll()
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleDXFeedPrices = useCallback((incoming: any[]) => {
    setPrices(incoming)
  }, [])

  const toggleCheck = (index: number) => {
    setChecklist(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const agents = [
    { name: 'OSIRIS', status: 'ACTIVE' },
    { name: 'HORUS', status: 'ACTIVE' },
    { name: 'NEPHTHYS', status: 'STANDBY' },
    { name: 'MAAT', status: 'ACTIVE' },
    { name: 'THOTH', status: 'STANDBY' },
    { name: 'SEKHMET', status: 'ACTIVE' },
    { name: 'ARGUS', status: 'ACTIVE' },
    { name: 'PYTHIA', status: 'STANDBY' },
    { name: 'RA', status: 'ACTIVE' },
    { name: 'HERMES', status: 'STANDBY' },
  ]

  const checklistItems = [
    'Macro bias confirmed',
    'News calendar checked',
    'Levels marked — VAH/VAL/POC',
    'Opening range identified',
    'Session bias established',
    'Price at valid level',
    'EMA confirmation present',
    'Order flow confirmed',
    'Absorption confirmed',
    'Stop loss within 25pts',
    'Min 1:3 R:R confirmed',
    'Valid time window',
  ]

  const tabs = ['COMMAND', 'GLOBE', 'CHARTS', 'INTEL', 'JOURNAL']

  const sectionTitle = (text: string) => (
    <div className="text-xs font-bold tracking-[0.25em] text-[#d4a017] mb-2 pb-1 border-b border-[#d4a017]/20">
      {text}
    </div>
  )

  return (
    <div className="h-screen w-screen bg-[#080808] text-[#e5e7eb] font-mono overflow-hidden flex flex-col">
      <DXFeedPrices onPricesUpdate={handleDXFeedPrices} />
      {/* Top Bar */}
      <div className="h-12 border-b border-[#d4a017]/15 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-[#d4a017]/40 flex items-center justify-center">
            <span className="text-[#d4a017] font-bold text-xs">A</span>
          </div>
          <span className="text-lg font-bold tracking-[0.3em] text-[#d4a017]">ANUBIS</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold tracking-wider">{currentTime?.toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' }) ?? '--:--:--'}</span>
          <span className="text-[10px] text-[#6b7280] tracking-wider">{currentTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }) ?? '...'} EST</span>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#d4a017] rounded-full animate-pulse" />
            <span className="tracking-wider">{marketSession}</span>
          </div>
          {['NET','DATA','SYS'].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
              <span className="text-[#6b7280]">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="h-9 border-b border-[#d4a017]/10 flex items-center px-4 shrink-0">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 text-xs tracking-wider transition-all duration-200 ${
              activeTab === tab ? 'text-[#d4a017] border-b-2 border-[#d4a017]' : 'text-[#6b7280] hover:text-[#e5e7eb]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'COMMAND' && (
          <div className="h-full flex flex-col bg-[#080808]">
            <div className="flex-1 flex min-h-0">

              {/* Left Column */}
              <div className="w-[21%] border-r border-[#d4a017]/10 flex flex-col min-h-0">
                <div className="flex-1 p-2 border-b border-[#d4a017]/10 flex flex-col min-h-0">
                  {sectionTitle('AGENT STATUS')}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {agents.map(agent => (
                      <div key={agent.name} className="flex items-center justify-between px-2 py-1 bg-[#d4a017]/5 border border-[#d4a017]/10">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-[#22c55e]' : 'bg-[#6b7280]'}`} />
                          <span className="text-[11px] tracking-wider">{agent.name}</span>
                        </div>
                        <span className={`text-[10px] ${agent.status === 'ACTIVE' ? 'text-[#22c55e]' : 'text-[#6b7280]'}`}>{agent.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-2 flex flex-col min-h-0">
                  {sectionTitle('SCT CHECKLIST')}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {checklistItems.map((item, i) => (
                      <div key={i} onClick={() => toggleCheck(i)}
                        className="flex items-center gap-1.5 px-1.5 py-1 bg-[#d4a017]/5 border border-[#d4a017]/10 cursor-pointer hover:bg-[#d4a017]/10 transition-colors">
                        <div className={`w-2.5 h-2.5 border flex items-center justify-center shrink-0 ${
                          checklist[i] ? 'bg-[#22c55e] border-[#22c55e]' : 'border-[#ef4444]'
                        }`}>
                          {checklist[i] && <span className="text-[7px] text-black font-bold">✓</span>}
                        </div>
                        <span className={`text-[11px] tracking-wide leading-tight ${checklist[i] ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Column */}
              <div className="flex-1 border-r border-[#d4a017]/10 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-hidden relative">
                  <Globe news={news} />
                </div>
                <div className="h-[36%] p-2 flex flex-col min-h-0 border-t border-[#d4a017]/10">
                  {sectionTitle('OSIRIS THOUGHT STREAM')}
                  <div className="flex-1 flex gap-2 min-h-0">
                    {['NQ', 'ES', 'MGC'].map((sym, colIndex) => (
                      <div key={sym} className="flex-1 bg-[#d4a017]/5 border border-[#d4a017]/10 p-2 flex flex-col min-h-0">
                        <div className="text-[9px] font-bold tracking-widest text-[#d4a017] mb-1.5 pb-1 border-b border-[#d4a017]/20">{sym}</div>
                        <div className="flex-1 space-y-1.5 overflow-hidden">
                          {osirisLines
                            .filter((_, i) => i % 3 === colIndex)
                            .map((line, i) => (
                              <div key={i} className="text-[12px] text-[#9ca3af] leading-relaxed">
                                <span className="text-[#d4a017]/40 text-[9px]">[{currentTime?.toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' }) ?? '--:--:--'}]</span>
                                <br />
                                {line}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-[21%] flex flex-col min-h-0">
                <div className="p-2 border-b border-[#d4a017]/10">
                  {sectionTitle('MAAT RISK')}
                  <div className="space-y-1.5">
                    {[
                      { label: 'DAILY LOSS LIMIT', value: '$5,000', color: 'text-[#e5e7eb]', bar: true },
                      { label: 'CURRENT DRAWDOWN', value: '-$1,750', color: 'text-[#ef4444]', bar: false },
                      { label: 'TRADES TODAY', value: '12', color: 'text-[#e5e7eb]', bar: false },
                      { label: 'SESSION STATUS', value: 'ACTIVE', color: 'text-[#22c55e]', bar: false },
                    ].map((item, i) => (
                      <div key={i} className="bg-[#d4a017]/5 border border-[#d4a017]/10 p-1.5">
                        <div className="text-[9px] text-[#6b7280] mb-0.5">{item.label}</div>
                        <div className={`text-xs font-bold tracking-wider ${item.color}`}>{item.value}</div>
                        {item.bar && <div className="w-full h-0.5 bg-[#d4a017]/20 mt-1"><div className="h-full bg-[#d4a017] w-[35%]" /></div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-2 border-b border-[#d4a017]/10 flex flex-col min-h-0">
                  {sectionTitle('NEWS / ALERTS')}
                  <div className="flex-1 bg-[#d4a017]/5 border border-[#d4a017]/10 p-1.5 overflow-y-auto">
                    <div className="space-y-1.5 text-[9px]">
                      {news.slice(0, 6).map((item, i) => {
                        const labelColor = item.importance === 'RED' ? 'text-[#ef4444]' : item.importance === 'ORANGE' ? 'text-[#f97316]' : 'text-[#d4a017]'
                        const impactColor = item.impact?.startsWith('-') ? 'text-[#ef4444]' : 'text-[#22c55e]'
                        return (
                          <div key={i}
                            onClick={() => item.url && window.open(item.url, '_blank')}
                            className="border-b border-[#d4a017]/10 pb-1 cursor-pointer hover:bg-[#d4a017]/10 transition-colors px-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-bold ${labelColor}`}>[{item.importance}] {item.source}</span>
                              <span className={`text-[8px] font-bold ${impactColor}`}>{item.impact?.startsWith('-') ? '↓' : '↑'} {item.impact}</span>
                            </div>
                            <div className="text-[#e5e7eb] leading-tight mt-0.5">{item.headline}</div>
                          </div>
                        )
                      })}
                      {news.length === 0 && <div className="text-[#6b7280]">Loading news...</div>}
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  {sectionTitle('RA COSMIC')}
                  <div className="space-y-1">
                    {[
                      { icon: '🌙', label: 'MOON PHASE', value: 'Waxing Gibbous', color: 'text-[#e5e7eb]' },
                      { icon: '⚡', label: 'SCHUMANN', value: '7.83 Hz', color: 'text-[#22c55e]' },
                      { icon: '☿', label: 'MERCURY', value: 'Direct', color: 'text-[#22c55e]' },
                      { icon: '☀️', label: 'SOLAR', value: 'Moderate', color: 'text-[#d4a017]' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-1 bg-[#d4a017]/5 border border-[#d4a017]/10">
                        <span className="text-sm">{item.icon}</span>
                        <div>
                          <div className="text-[9px] text-[#6b7280]">{item.label}</div>
                          <div className={`text-[10px] font-bold ${item.color}`}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-11 flex items-center px-4 gap-4 bg-[#080808] border-t border-[#d4a017]/15 shrink-0">
              <div className="flex gap-3">
                {prices.map(item => (
                  <div key={item.symbol} className="bg-[#d4a017]/5 border border-[#d4a017]/10 px-3 py-1 flex items-center gap-3">
                    <span className="text-[10px] text-[#d4a017] font-bold tracking-widest">{item.symbol}</span>
                    <span className="text-sm font-bold tracking-wider">
                      {item.price > 0 ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                    </span>
                    <span className={`text-[10px] font-bold ${item.change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {item.price > 0 ? `${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)} (${item.percent >= 0 ? '+' : ''}${item.percent.toFixed(2)}%)` : '---'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-px h-6 bg-[#d4a017]/20" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#d4a017] rounded-full animate-pulse" />
                <span className="text-xs tracking-wider">{marketSession}</span>
              </div>
              <div className="w-px h-6 bg-[#d4a017]/20" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#6b7280]">NEXT EVENT:</span>
                <span className="text-xs text-[#d4a017]">FOMC in 1h 45m</span>
              </div>
              <div className="w-px h-6 bg-[#d4a017]/20" />
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${marketOpen ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                <span className={`text-xs tracking-wider ${marketOpen ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'GLOBE' && (
          <div className="h-full bg-[#080808]">
            <Globe news={news} />
          </div>
        )}

        {activeTab === 'CHARTS' && (
          <div className="h-full flex flex-col bg-[#080808] p-2 gap-2">
            <div className="flex gap-2 h-full">
              <div className="flex flex-col flex-1 gap-1">
                <div className="text-xs font-mono font-bold tracking-[0.25em] text-[#d4a017]">NQ</div>
                <iframe
                  src="https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21&interval=5&theme=dark"
                  className="flex-1 w-full border-0 rounded"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <div className="text-xs font-mono font-bold tracking-[0.25em] text-[#d4a017]">ES</div>
                <iframe
                  src="https://www.tradingview.com/chart/?symbol=CME_MINI%3AES1%21&interval=5&theme=dark"
                  className="flex-1 w-full border-0 rounded"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <div className="text-xs font-mono font-bold tracking-[0.25em] text-[#d4a017]">MGC</div>
                <iframe
                  src="https://www.tradingview.com/chart/?symbol=COMEX%3AMC1%21&interval=5&theme=dark"
                  className="flex-1 w-full border-0 rounded"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'INTEL' && (
          <div className="h-full flex flex-col p-3 gap-3">
            {sectionTitle('LIVE MARKET INTELLIGENCE — FINNHUB × OSIRIS')}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-2">
                {news.map((item, i) => {
                  const borderColor = item.importance === 'RED' ? 'border-[#ef4444]' : item.importance === 'ORANGE' ? 'border-[#f97316]' : 'border-[#d4a017]'
                  const labelColor = item.importance === 'RED' ? 'text-[#ef4444]' : item.importance === 'ORANGE' ? 'text-[#f97316]' : 'text-[#d4a017]'
                  const impactColor = item.impact?.startsWith('-') ? 'text-[#ef4444]' : 'text-[#22c55e]'
                  return (
                    <div key={i}
                      onClick={() => item.url && window.open(item.url, '_blank')}
                      className={`bg-[#d4a017]/5 border-l-4 ${borderColor} border border-[#d4a017]/10 p-3 cursor-pointer hover:bg-[#d4a017]/10 transition-colors`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-bold tracking-wider ${labelColor}`}>[{item.importance}]</span>
                          <span className="text-[#d4a017] text-[11px] font-bold">{item.source}</span>
                          <span className="text-[#6b7280] text-[10px]">{item.time} EST</span>
                        </div>
                        <span className={`text-[14px] font-bold tracking-wider mr-4 ${impactColor}`}>
                          {item.impact?.startsWith('-') ? '↓' : '↑'} {item.impact}
                        </span>
                      </div>
                      <div className="text-[13px] text-[#e5e7eb] leading-relaxed mb-1.5">{item.headline}</div>
                      {item.analysis && <div className="text-[11px] text-[#6b7280] italic leading-relaxed">{item.analysis}</div>}
                    </div>
                  )
                })}
                {news.length === 0 && <div className="text-[#6b7280] text-sm">Loading intelligence feed...</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'JOURNAL' && (
          <div className="h-full p-3 flex flex-col">
            {sectionTitle('THOTH TRADE JOURNAL')}
            <div className="flex-1 bg-[#d4a017]/5 border border-[#d4a017]/10 p-2 overflow-hidden">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-[#d4a017]/20">
                    {['DATE','INSTRUMENT','SETUP','ENTRY','STOP','TARGET','RESULT','P&L'].map(h => (
                      <th key={h} className="text-left py-1.5 px-2 text-[#6b7280] tracking-wider font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['2024-01-15','NQ','POC Bounce','20800.00','20775.00','20900.00','WIN','+$2,500'],
                    ['2024-01-15','ES','VWAP Reject','5830.00','5820.00','5850.00','LOSS','-$500'],
                    ['2024-01-14','MGC','VAL Hold','2735.00','2725.00','2750.00','WIN','+$750'],
                    ['2024-01-14','NQ','ORH Break','20750.00','20700.00','20850.00','WIN','+$2,000'],
                    ['2024-01-13','ES','VAH Reject','5800.00','5790.00','5825.00','LOSS','-$250'],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[#d4a017]/10 hover:bg-[#d4a017]/5">
                      {row.map((cell, j) => (
                        <td key={j} className={`py-1.5 px-2 ${
                          j === 6 ? (cell === 'WIN' ? 'text-[#22c55e]' : 'text-[#ef4444]') :
                          j === 7 ? (cell.startsWith('+') ? 'text-[#22c55e]' : 'text-[#ef4444]') :
                          'text-[#e5e7eb]'
                        }`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}