import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const csvPath = path.join(root, 'cases.csv')

function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      cells.push(cell)
      cell = ''
    } else {
      cell += char
    }
  }
  cells.push(cell)
  return cells
}

function readCases() {
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/)
  const headers = parseCsvLine(lines.shift())
  return lines.map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

export function listCases() {
  return readCases()
}

export function findCase(caseId) {
  return listCases().find((item) => item.case_id === caseId) ?? null
}

export function presentCase(item) {
  return {
    id: item.case_id,
    contactName: item.contact_name,
    contactRole: item.contact_role,
    organization: item.organization,
    authenticationHint: item.authentication_hint,
    proposalNumber: item.proposal_number,
    status: item.case_status,
    explanation: item.status_explanation,
    nextStep: item.next_step,
    source: item.source_audio,
  }
}

export function dynamicVariables(item) {
  return {
    case_id: item.case_id,
    case_contact_name: item.contact_name,
    case_contact_role: item.contact_role,
    case_organization: item.organization,
    case_authentication_hint: item.authentication_hint,
    case_proposal_number: item.proposal_number,
    case_status: item.case_status,
    case_explanation: item.status_explanation,
    case_next_step: item.next_step,
  }
}
