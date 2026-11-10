import { useEffect, useState } from 'react'
import { catalog, clearToken, login, readToken, writeToken } from './api.js'
import { Login } from './Login.jsx'
import { Talk } from './Talk.jsx'

export function App() {
  const [token, setToken] = useState(readToken)
  const [agent, setAgent] = useState(null)
  const [booting, setBooting] = useState(Boolean(readToken()))
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setAgent(null)
      setBooting(false)
      return undefined
    }
    let cancelled = false
    setBooting(true)
    catalog(token)
      .then((data) => {
        if (!cancelled) {
          setAgent(data.voice)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          clearToken()
          setToken('')
          setAgent(null)
          setLoginError(error.message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBooting(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleLogin(next) {
    setLoginLoading(true)
    setLoginError('')
    try {
      await login(next)
      writeToken(next)
      setToken(next)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  function signOut() {
    clearToken()
    setToken('')
    setAgent(null)
  }

  if (!token || !agent) {
    return (
      <Login
        error={loginError}
        loading={loginLoading || booting}
        onSubmit={handleLogin}
      />
    )
  }

  return <Talk token={token} agent={agent} onSignOut={signOut} />
}
