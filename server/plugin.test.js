import assert from 'node:assert/strict'
import test from 'node:test'
import { VOICE_AGENT, tokensMatch } from './agents.js'
import { dispatchApi } from './plugin.js'

const env = {
  loginToken: 'token-da-bancada',
  apiKey: 'chave',
  voiceAgentId: VOICE_AGENT.id,
}

function call(method, pathname, token, search = '', body) {
  return dispatchApi(
    {
      method,
      pathname,
      searchParams: new URLSearchParams(search),
      token,
      body,
    },
    env,
  )
}

test('tokensMatch aceita o mesmo segredo e rejeita outro', () => {
  assert.equal(tokensMatch('token-da-bancada', 'token-da-bancada'), true)
  assert.equal(tokensMatch('outro', 'token-da-bancada'), false)
  assert.equal(tokensMatch('token-da-bancada', ''), false)
})

test('login recusa token errado e aceita o configurado', async () => {
  const denied = await call('POST', '/api/login', '', '', { token: 'errado' })
  assert.equal(denied.status, 401)

  const ok = await call('POST', '/api/login', '', '', { token: env.loginToken })
  assert.equal(ok.status, 200)
  assert.equal(ok.payload.ok, true)
})

test('catalog abre a sessão do Pedro e a conversa de outro agente fica de fora', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async (url) => {
    const href = String(url)
    if (href.includes('/agents/')) {
      return new Response(JSON.stringify({ name: 'Porto Saúde - Pedro - Receptivo' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }
    if (href.includes('get-signed-url')) {
      return new Response(JSON.stringify({ signed_url: 'wss://exemplo' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }
    if (href.includes('/conversations/conv_4801m64ptqcke33aq74hz968qm1m')) {
      return new Response(
        JSON.stringify({
          conversation_id: 'conv_4801m64ptqcke33aq74hz968qm1m',
          agent_id: VOICE_AGENT.id,
          status: 'done',
          analysis: { transcript_summary: 'Status da proposta informado.' },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }
    if (href.includes('/conversations/')) {
      return new Response(
        JSON.stringify({
          conversation_id: 'conv_9991m64ptqcke33aq74hz968qm1m',
          agent_id: 'agent_de_outro_lugar_xxxx',
          status: 'done',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }
    return new Response('{}', { status: 404 })
  }

  try {
    const catalog = await call('GET', '/api/catalog', env.loginToken)
    assert.equal(catalog.status, 200)
    assert.equal(catalog.payload.voice.name, 'Porto Saúde - Pedro - Receptivo')
    assert.equal(catalog.payload.voice.id, VOICE_AGENT.id)

    const signed = await call('GET', '/api/signed-url', env.loginToken)
    assert.equal(signed.status, 200)
    assert.equal(signed.payload.signedUrl, 'wss://exemplo')

    const badId = await call('GET', '/api/conversation', env.loginToken, 'conversation_id=nao-e-id')
    assert.equal(badId.status, 400)

    const result = await call(
      'GET',
      '/api/conversation',
      env.loginToken,
      'conversation_id=conv_4801m64ptqcke33aq74hz968qm1m',
    )
    assert.equal(result.status, 200)
    assert.equal(result.payload.summary, 'Status da proposta informado.')

    const foreign = await call(
      'GET',
      '/api/conversation',
      env.loginToken,
      'conversation_id=conv_9991m64ptqcke33aq74hz968qm1m',
    )
    assert.equal(foreign.status, 404)
  } finally {
    globalThis.fetch = original
  }
})
