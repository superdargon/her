const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

export async function api(path: string, options?: RequestInit): Promise<any> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })
  } catch (err: any) {
    throw new Error(`网络错误：无法连接到服务器 (${err.message})`)
  }

  const text = await res.text()
  if (!text) {
    if (!res.ok) throw new Error(`服务器错误：${res.status} ${res.statusText}`)
    return {}
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`服务器返回了无效数据：${text.slice(0, 200)}`)
  }

  if (data.error) throw new Error(data.error)
  return data
}

// Auth
export async function register(phone: string, password: string) {
  const data = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
  localStorage.setItem('token', data.token)
  return data
}

export async function login(phone: string, password: string) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
  localStorage.setItem('token', data.token)
  return data
}

export async function getMe() {
  return api('/auth/me')
}

// Characters
export async function getCharacters() {
  return api('/characters')
}

export async function getCharacter(id: string) {
  return api(`/characters/${id}`)
}

export async function createCharacter(data: { name: string; avatar?: string; personality?: string; greeting?: string }) {
  return api('/characters', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCharacter(id: string, data: { name?: string; avatar?: string; personality?: any; greeting?: string }) {
  return api(`/characters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCharacter(id: string) {
  return api(`/characters/${id}`, { method: 'DELETE' })
}
export async function createExMirrorCharacter(data: { alias: string; basicInfo?: string; personality?: string; chatText?: string }) {
  return api('/ex-mirror', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Bots / QR
export async function getBotQrcode(characterId: string) {
  return api(`/bots/${characterId}/qrcode`, { method: 'POST' })
}

export async function confirmBot(characterId: string, qrcode: string) {
  return api(`/bots/${characterId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ qrcode }),
  })
}

export async function getBots() {
  return api('/bots')
}

export async function deleteBot(botId: string) {
  return api(`/bots/${botId}`, { method: 'DELETE' })
}

// Config
export async function getConfig() {
  return api('/config')
}

export async function saveConfig(data: { aiProvider?: string; aiApiKey?: string; aiModel?: string; aiBaseUrl?: string }) {
  return api('/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getRelationshipMemory(characterId: string) {
  return api(`/relationship-memory/${characterId}`)
}

export async function saveRelationshipMemory(
  characterId: string,
  data: { affection?: number; trust?: number; loneliness?: number; fatigue?: number; stability?: number; lastInteractionAt?: number },
) {
  return api(`/relationship-memory/${characterId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function resetRelationshipMemory(characterId: string) {
  return api(`/relationship-memory/${characterId}/reset`, {
    method: 'POST',
  })
}

export async function getProactiveEvents(limit = 20) {
  return api(`/proactive-events?limit=${limit}`)
}

export async function sendProactiveTest(characterId: string) {
  return api(`/proactive-test/${characterId}`, { method: 'POST' })
}

export async function getRelationshipMemoryEvents(characterId: string, limit = 20) {
  return api(`/relationship-memory-events/${characterId}?limit=${limit}`)
}

export async function getPersonaStabilizerEvents(characterId: string, limit = 20) {
  return api(`/persona-stabilizer-events/${characterId}?limit=${limit}`)
}

export async function getPersonaStabilizerStats(characterId: string) {
  return api(`/persona-stabilizer-stats/${characterId}`)
}

// Messages
export async function getMessages(botId: string, offset = 0, limit = 50) {
  return api(`/messages/${botId}?offset=${offset}&limit=${limit}`)
}

export async function clearMessages(botId: string) {
  return api(`/messages/${botId}`, { method: 'DELETE' })
}

export async function getLocalMessages(characterId: string) {
  return api(`/local-messages/${characterId}`)
}

export async function clearLocalMessages(characterId: string) {
  return api(`/local-messages/${characterId}`, { method: 'DELETE' })
}

// Subscribe
export async function subscribe(plan: string) {
  return api('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}

export async function getUsage() {
  return api('/usage')
}


