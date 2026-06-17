# ANUBIS TERMINAL v2

## Claude Code Behavior Rules
- Never explain what you're about to do, just do it
- Never summarize what you just did, just confirm done
- Always edit files directly, never show code in chat
- One file at a time, smallest change possible
- Never read files you weren't asked about

## Project Location
C:\Users\Noreaga\anubis-terminal-v2

## Stack
Next.js 16.2.9, TypeScript, Tailwind v4, React 19, Three.js 0.184, three-globe 2.45.2
Anthropic SDK 0.104, Supabase, Clerk, ElevenLabs, Framer Motion, Zustand

## Trading Context
- Primary: NQ futures (MNQ) via My Funded Futures
- Secondary: ES (MES), MGC
- Strategy: Session Confluence Trading (SCT) by MajorTrdz
- Data: Yahoo Finance (NQ=F, ES=F, GC=F) — 15s polling
- News: Finnhub (NEXT_PUBLIC_FINNHUB_KEY) — enriched by Claude AI
- Order flow tools: DeepCharts + DeepDOM (My Funded Futures)
- NQ point value: $20 per point per contract

## File Structure
app/page.tsx — entire terminal UI (5 tabs: COMMAND, GLOBE, CHARTS, INTEL, JOURNAL)
app/api/prices/route.ts — Yahoo Finance price feed
app/api/osiris/route.ts — OSIRIS Claude agent (POST, takes prices array)
app/api/news/route.ts — Finnhub + Claude news enrichment
components/Globe.tsx — Three.js globe with country labels + news pillars
.env.local — all API keys (never commit)

## Agent Roster
OSIRIS (market AI — ACTIVE), HORUS (ACTIVE), NEPHTHYS (STANDBY)
MAAT (risk — ACTIVE), THOTH (journal — STANDBY), SEKHMET (ACTIVE)
ARGUS (ACTIVE), PYTHIA (STANDBY), RA (cosmic — ACTIVE), HERMES (STANDBY)

## Current State (June 16 2026)
- Live NQ/ES/MGC prices in bottom bar, 15s refresh
- OSIRIS thought stream: 3 columns (NQ/ES/MGC), real Claude analysis, 30s refresh
- News feed: Finnhub + Claude importance/impact scoring (RED/ORANGE/YELLOW)
- Globe: Three.js with country borders, labels, news pillars colored by importance
- Market session detection: ASIA 8pm-midnight EST, LONDON 2am-5am, NEW YORK 8am-5pm
- Futures market open/closed detection (Sunday 6pm - Friday 5pm EST)

## Known Issues
- page.tsx has Unicode encoding corruption (broken emojis, arrows show as â†" etc)
- Globe GLOBE tab doesn't pass news prop to Globe component
- Globe labels working via ThreeGlobe built-in label system

## Critical Rules
- NEVER use PowerShell here-string syntax to write files — it corrupts them
- Always write files directly in Windsurf editor (Ctrl+A, delete, paste)
- Always provide COMPLETE file rewrites, never partial edits
- Tailwind only, no custom CSS files
- Model: claude-sonnet-4-6
- Editor: Windsurf on Windows

---

## SCT STRATEGY — FULL FRAMEWORK (MajorTrdz)

### Core Philosophy
The market is an auction. Every trade requires multiple layers of evidence.
Never trade in open space — only at defined levels where institutional volume concentrated.
Scalping NQ: trades under 10 minutes, targeting defined point moves, strict risk management.
Consistency and precision over home run trades.

### Sessions (EST)
| Session | Time | Notes |
|---|---|---|
| New York RTH | 9:30 AM – 3:45 PM | Main session. Highest volume. Primary trading window |
| Overnight/ETH | 6:00 PM – 9:30 AM | Extended hours. Thinner volume. Asia + London overlap |
| BEST WINDOW | 9:30 AM – 11:00 AM | London/NY overlap. Cleanest order flow of the day |
| AVOID Lunch | 11:00 AM – 12:30 PM | Dead zone. Unreliable setups. DO NOT TRADE |
| AVOID Close | 2:00 PM – 3:45 PM | Erratic position squaring. Increased risk |

### Tools
**Volume Profile**
- POC (Point of Control): Most volume price. Center of gravity. Strongest institutional memory. Priority 1.
- VAH (Value Area High): Top of 70% volume zone. Acts as resistance from below. Priority 2.
- VAL (Value Area Low): Bottom of 70% volume zone. Acts as support from above. Priority 2.
- HVN (High Volume Node): Price slows and consolidates here. Priority 4.
- LVN (Low Volume Node): Thin area — price moves FAST through here. Your runway. Priority 4.

**VWAP**
- Institutions use VWAP as primary execution benchmark
- Above VWAP = buyers in control = look for longs
- Below VWAP = sellers in control = look for shorts
- At 2nd/3rd std dev band = statistically extended = snap-back to VWAP is high probability
- Previous session VWAP close = magnet at new session open

**EMAs**
- 10 EMA (red): Short-term trend. Price bouncing consistently = trend. Chopping through = no trend, wait.
- 21 EMA (blue): Medium-term. Stronger S/R. Bounce off 21 during trend = higher conviction entry.
- EMAs are CONFLUENCE, not standalone signals. They add weight when aligned with VP level or VWAP.

**Order Flow (via DeepCharts/DeepDOM)**
- Footprint Chart: Volume at bid/ask at every price level inside every candle
- Delta: Ask volume minus bid volume. Positive = buyers aggressive. Negative = sellers aggressive.
- CVD (Cumulative Volume Delta): Delta accumulated over time. Divergence = move running out of fuel.
  - Price new high + CVD declining = aggressive buying fading = REVERSAL WARNING
- Liquidity Heatmap: Large passive limit orders in order book. Price drawn toward bright zones.

**ABSORPTION — THE MANDATORY FILTER**
Absorption = significant aggressive orders hit a level and price does NOT move through it.
An institution is sitting there absorbing every order. This is the single most important signal.
What it looks like on footprint: large numbers at one or two price levels, price holds or barely moves.
NO ABSORPTION = NO TRADE. Period.

### Pre-Session Preparation (Build Your Map)
For NY RTH session: use Previous Overnight Session VP + VWAP Close
For Overnight session: use Previous NY RTH Session VP + VWAP Close

Mark before every session:
1. Draw boxes around VAH and VAL — extend right as value area boundaries
2. Mark POC as horizontal line — primary magnet level
3. Mark HVN clusters as zones — price will slow here
4. Mark LVNs as thinner lines — fast-move runways between levels
5. Mark previous session VWAP close — first directional target of new session
6. Mark previous session high and low — liquidity targets

Opening Range (9:30-9:45 AM EST):
- Mark ORH and ORL at exactly 9:45 AM before looking for any trade
- Clean break above ORH with strong impulse + volume = long bias confirmed
- Clean break below ORL = short bias confirmed
- Breakout without volume = likely a fake, wait for absorption + order flow confirmation

### Reading Bias (Answer in This Order)
1. MACRO: Where is price relative to weekly VWAP on daily chart? Above = favor longs. Below = favor shorts.
2. OPENING BIAS: Where did previous session VWAP close? Opening above = early long lean. Below = early short lean.
3. SESSION VWAP: Is price above or below current VWAP? Updates real time.
4. EXTENSION: Is price near 2nd or 3rd std dev band? Yes = snap-back trade in play regardless of direction.
5. OPENING RANGE: Did price break ORH or ORL with conviction? That direction = session bias.

Bias is a starting point, not a cage. If bias is long but price is breaking down with aggressive delta — respect the market.

### Valid Setup Levels (Priority Order)
1. Previous Session POC — strongest institutional memory
2. VAH or VAL — boundary of 70% institutional volume
3. Previous Session VWAP Close — magnet at session open
4. HVN/LVN Boundaries — volume cluster edges
5. Current Session VWAP — real-time fair value
6. VWAP 2nd/3rd Std Dev Band — statistical extension snap-back
7. Opening Range High/Low — session structure breakout/rejection

### Confirmation Stack (ALL THREE REQUIRED)
| Confirmation | Requirement | Status |
|---|---|---|
| EMA Confirmation | 10 or 21 EMA respecting the level — bounce or reclaim | REQUIRED |
| Order Flow Confirmation | At least ONE of: delta stacking, CVD divergence, heatmap resting orders | REQUIRED |
| Absorption | Large volume at level on footprint — price CANNOT break through | MANDATORY |

### Risk Management (Non-Negotiable)
**Stop Loss Rules:**
- Place SL behind next logical level beyond entry — not arbitrary point distance
- Target 10-20 point stops. If level is valid, price should not need more than this to prove you wrong.
- HARD MAXIMUM: 25 points — absolute rule, no exceptions
- If nearest logical level requires more than 25 pts SL — pass on the setup

**1% Rule — Contract Sizing:**
- Never risk more than 1% of account on single trade
- $50k account = $500 max risk. NQ = $20/point.
- 1 contract: max $500 risk, max 25 point stop
- 2 contracts: max $500 risk, max 12.5 point stop
- 3 contracts: max $500 risk, max 8 point stop
- 4 contracts: max $500 risk, max 6 point stop

**Take Profit Rules:**
- Minimum 1:3 risk/reward on every trade — if stop is 15pts, target is 45pts minimum
- Place TP at next key level satisfying 1:3 ratio — VAH, VAL, POC, VWAP, ORH, ORL
- Partial exits acceptable — take portion at first key level, let rest run

**Session Management:**
- Daily stop loss: lose two full setups in one session — STOP TRADING IMMEDIATELY
- Daily goal: once hit — stop trading or reduce to minimum size. Never give back the day.
- Best window: 9:30 AM to 11:00 AM EST. Hit goal in this window and walk away.

### Time Filters (Avoid These Windows)
| Window | Why |
|---|---|
| 10:00–11:00 AM | Post-opening drive chop. Momentum exhausts. |
| 11:00 AM–12:30 PM | Lunch dead zone. Volume drops. Levels get faded. AVOID ENTIRELY. |
| 2:00–3:45 PM | End of day position squaring. Erratic unpredictable moves. |

### News Filter
Check forexfactory.com before every session — red folder events only.
Stop trading 5 min before any red folder event. Do not re-enter until 5 min after release.
Key events that move NQ: CPI, FOMC Decisions, Non-Farm Payrolls (NFP), GDP, PPI, Weekly Jobless Claims

### Trade Journal (Log Every Trade)
Fields: Date/Time, Level (POC/VAH/VAL/VWAP/ORH/ORL), Entry Price, Stop Loss, Take Profit,
Result (Win/Loss), Points gained/lost, Dollar amount, Confirmations present (EMA/delta/CVD/heatmap),
Absorption confirmed (Yes/No), Notes (what went well, what to improve)
Review weekly — after 30 trades patterns emerge showing which level combinations produce best results.

### OSIRIS Intelligence Priorities
OSIRIS should always analyze through the SCT lens:
- Is price at or near a key SCT level (POC, VAH, VAL, VWAP, ORH/ORL)?
- What is the current session bias based on VWAP position?
- Are we in a valid trading window or a dead zone?
- Is NQ/ES showing divergence (correlation break = warning)?
- Is MGC spiking? (risk-off signal, watch NQ for reversal)
- Are we near 2nd/3rd VWAP std dev band? (snap-back setup likely)
- Any major news events coming that invalidate current setups?
- LVN present between current price and next level? (fast move potential)
- Is current move showing CVD divergence? (exhaustion warning)

---

## Pending Features
- Charts tab: TradingView embed for NQ/ES/MGC
- RA COSMIC: real moon phase, Schumann, Mercury retrograde, solar data
- Supabase: persist SCT checklist and trade journal
- ElevenLabs: OSIRIS voice readout
- dxFeed WebSocket: real-time tick data (long term)
- Python CrewAI layer for agent autonomy