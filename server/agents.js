import { timingSafeEqual } from 'node:crypto'

const AGENT_ID = /^[a-zA-Z0-9_-]{8,128}$/

export const VOICE_AGENT = {
  id: 'agent_7701m73b3e6zenjvr87n0875m4yz',
  name: 'Porto Saúde - Pedro - Receptivo',
  description: 'Conversa com o Pedro sobre o status da proposta de demonstração.',
}

export function isAgentId(value) {
  return AGENT_ID.test(String(value ?? '').trim())
}

export function tokensMatch(given, expected) {
  const left = Buffer.from(String(given ?? ''))
  const right = Buffer.from(String(expected ?? ''))
  if (!right.length || left.length !== right.length) {
    return false
  }
  return timingSafeEqual(left, right)
}

export function agentDisplayName(agent) {
  const value = agent?.name
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  return ''
}

export function resolveAgent(env) {
  const id = String(env.voiceAgentId ?? '').trim()
  return {
    ...VOICE_AGENT,
    id: isAgentId(id) ? id : VOICE_AGENT.id,
  }
}
