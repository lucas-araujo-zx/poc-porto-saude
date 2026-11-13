import { Mark } from './Mark.jsx'

export function CasePicker({ cases, onOpen, onSignOut }) {
  return (
    <div className="picker-page">
      <header className="picker-top">
        <Mark />
        <div className="picker-actions">
          <span>Selecione um atendimento para testar</span>
          <button type="button" className="quiet" onClick={onSignOut}>
            Sair
          </button>
        </div>
      </header>

      <main className="picker-main">
        <div className="picker-heading">
          <p className="kicker">Casos de uso</p>
          <h1>Escolha uma proposta para simular.</h1>
          <p>O caso selecionado será disponibilizado ao Pedro durante o atendimento.</p>
        </div>

        <div className="case-table-wrap">
          <table className="case-table">
            <thead>
              <tr>
                <th>Contato</th>
                <th>Perfil</th>
                <th>Organização</th>
                <th>Proposta</th>
                <th>Status</th>
                <th aria-label="Abrir caso" />
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.contactName || 'Contato não identificado'}</strong>
                    <span>{item.authenticationHint || 'Dados de autenticação do atendimento'}</span>
                  </td>
                  <td>{item.contactRole || 'Não informado'}</td>
                  <td>{item.organization || '—'}</td>
                  <td><code>{item.proposalNumber}</code></td>
                  <td><span className="case-status">{item.status}</span></td>
                  <td>
                    <button type="button" className="case-open" onClick={() => onOpen(item)}>
                      Testar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
