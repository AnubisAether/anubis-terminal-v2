import { NextResponse } from 'next/server'

const AUTH_URL = 'https://authdxfeed.volumetricatrading.com/api/v2/auth/token'
const PLT_KEY = 'fdsfAp1!kmr!_ty215452f1sd1fdfdmnMM'
function getAuthBody() {
  const state = crypto.randomUUID()
  return {
    login: 'MFFUPAIvomOTip',
    password: 'I22DsTQ-?YAk1a6qY&+x',
    withDetails: true,
    version: 5,
    environment: 0,
    state,
    connectOnlyTrading: false,
    appVerificationState: state,
    appVerificationCode: null,
  }
}

let cachedEndpoint: string | null = null
let cachedToken: string | null = null
let tokenExpiration: number = 0

async function getToken(): Promise<{ endpoint: string; token: string }> {
  if (cachedToken && cachedEndpoint && Date.now() < tokenExpiration) {
    return { endpoint: cachedEndpoint, token: cachedToken }
  }

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      VolPltfKey: PLT_KEY,
    },
    body: JSON.stringify(getAuthBody()),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status}`)
  }

  const json = await res.json()
  const data = json.data ?? json

  cachedEndpoint = data.dataEndpoint
  cachedToken = data.dataToken
  tokenExpiration = data.tradingRestTokenExpiration ?? 0

  if (!cachedEndpoint || !cachedToken) {
    throw new Error('Missing dataEndpoint or dataToken in auth response')
  }

  return { endpoint: cachedEndpoint, token: cachedToken }
}

export async function GET() {
  try {
    const { endpoint, token } = await getToken()
    return NextResponse.json({ endpoint, token, success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Auth error', success: false }, { status: 502 })
  }
}
