'use client'

import { useEffect, useRef } from 'react'
import { DXLinkWebSocketClient, DefaultDXLinkWebSocketConnector } from '@dxfeed/dxlink-websocket-client'

const SYMBOLS = ['/NQ:XCME', '/ES:XCME', '/MGC:XCME']
const SYMBOL_MAP: Record<string, string> = {
  '/NQ:XCME': 'NQ',
  '/ES:XCME': 'ES',
  '/MGC:XCME': 'MGC',
}

interface Props {
  onPricesUpdate: (prices: any[]) => void
}

export default function DXFeedPrices({ onPricesUpdate }: Props) {
  const clientRef = useRef<DXLinkWebSocketClient | null>(null)
  const pricesRef = useRef<Record<string, any>>({})

  useEffect(() => {
    let client: DXLinkWebSocketClient | null = null

    async function init() {
      try {
        const res = await fetch('/api/dxfeed-proxy')
        const { endpoint, token, success } = await res.json()
        if (!success) return

        client = new DXLinkWebSocketClient(new DefaultDXLinkWebSocketConnector())
        clientRef.current = client

        client.connect(endpoint)
        client.setAuthToken(token)

        const channel = client.openChannel('FEED', { contract: 'AUTO' })

        channel.addMessageListener((message: any) => {
          console.log('DXFeed message:', JSON.stringify(message))
          if (message.type === 'FEED_DATA') {
            const data = message.data
            if (!Array.isArray(data)) return
            for (const entry of data) {
              if (!entry || typeof entry !== 'object') continue
              const symbol = entry.eventSymbol
              const bidPrice = entry.bidPrice
              if (symbol && SYMBOL_MAP[symbol] && bidPrice) {
                pricesRef.current[symbol] = {
                  symbol: SYMBOL_MAP[symbol],
                  price: entry.askPrice ? (entry.bidPrice + entry.askPrice) / 2 : entry.bidPrice,
                  change: 0,
                  percent: 0,
                }
              }
            }
            onPricesUpdate(Object.values(pricesRef.current))
          }
        })

        channel.addStateChangeListener((state: any) => {
          console.log('DXFeed channel state:', state)
          if (state === 'OPENED') {
            channel.send({
              type: 'FEED_SUBSCRIPTION',
              add: SYMBOLS.map((s) => ({ type: 'Quote', symbol: s })),
            })
          }
        })
      } catch (e) {
        console.error('DXFeed init failed', e)
      }
    }

    init()

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, [onPricesUpdate])

  return null
}
