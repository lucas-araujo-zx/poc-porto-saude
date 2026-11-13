import { useEffect, useState } from 'react'
import { catalog, clearToken, login, readToken, writeToken } from './api.js'
import { CasePicker } from './CasePicker.jsx'
import { Login } from './Login.jsx'
import { Talk } from './Talk.jsx'

export function App() {
  const [token, setToken] = useState(readToken)
  const [agent, setAgent] = useState(null)
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [booting, setBooting] = useState(Boolean(readToken()))
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setAgent(null)
      setCases([])
      setSelectedCase(null)
      setBooting(false)
      return undefined
    }
    let cancelled = false
    setBooting(true)
    catalog(token)
      .then((data) => {
        if (!cancelled) {
          setAgent(data.voice)
          setCases(data.cases ?? [])
        }
      })
      .catch((error) => {
        if (!cancelled) {
          clearToken()
          setToken('')
          setAgent(null)
          setCases([])
          setSelectedCase(null)
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
    setCases([])
    setSelectedCase(null)
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

  if (!selectedCase) {
    return (
      <CasePicker
        cases={cases}
        onOpen={setSelectedCase}
        onSignOut={signOut}
      />
    )
  }

  return (
    <Talk
      key={selectedCase.id}
      token={token}
      agent={agent}
      caseData={selectedCase}
      onBack={() => setSelectedCase(null)}
      onSignOut={signOut}
    />
  )
}
