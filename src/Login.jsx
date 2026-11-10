import { useEffect, useState } from 'react'
import { Mark } from './Mark.jsx'

export function Login({ error, loading, onSubmit }) {
  const [token, setToken] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const next = token.trim()
    if (!next) {
      setLocalError('Cole o token de acesso.')
      return
    }
    setLocalError('')
    onSubmit(next)
  }

  const message = localError || error

  return (
    <div className="login-page">
      <a className="skip-link" href="#entrar">
        Ir para o acesso
      </a>
      <header className="login-top">
        <Mark />
        <p>Laboratório do beneficiário</p>
      </header>
      <section className="login-stage">
        <div className="login-copy">
          <h1>Fale com o Pedro sobre o status da proposta.</h1>
          <p>
            O token abre o atendimento. A base de demonstração fica na barra ao lado, para consultar durante a conversa.
          </p>
        </div>
        <div className="login-shell">
          <form id="entrar" className="login-panel" autoComplete="off" onSubmit={handleSubmit}>
            <div className="login-autofill-trap" aria-hidden="true">
              <input type="text" tabIndex={-1} autoComplete="username" />
            </div>
            <label className="field">
              <span>Token de acesso</span>
              <input
                type="password"
                name="ex_access"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="Cole o token recebido"
                value={token}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            <button type="submit" className="cta" disabled={loading}>
              <span>{loading ? 'Verificando...' : 'Entrar'}</span>
            </button>
            {message ? (
              <p className="form-error" role="alert">
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  )
}
