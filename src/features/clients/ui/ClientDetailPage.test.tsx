import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ClientDetailPage } from './ClientDetailPage'
import { createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/clientes/${id}`]}>
      <Routes>
        <Route path="/clientes/:id" element={<ClientDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ClientDetailPage', () => {
  it('shows all client data and the history timeline, newest first', () => {
    renderDetail('cli-004')
    expect(screen.getByRole('heading', { level: 1, name: /Hospital Metropolitano/ })).toBeInTheDocument()
    expect(screen.getByText('Ing. Esteban Rojas')).toBeInTheDocument()
    expect(screen.getByText('+506 2205-8800')).toBeInTheDocument()
    expect(screen.getByText('biomedica@hmetropolitano.cr')).toBeInTheDocument()
    expect(screen.getByText(/Monitores de signos vitales/)).toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Historial de contacto' })).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Cotización formal enviada')
    expect(items[1]).toHaveTextContent('Visita técnica')
  })

  it('adds a note that is persisted', async () => {
    const user = userEvent.setup()
    renderDetail('cli-004')
    await user.type(screen.getByLabelText('Nueva nota'), 'Llamar al jefe de biomédica')
    await user.click(screen.getByRole('button', { name: 'Guardar nota' }))
    const list = screen.getByRole('list', { name: 'Historial de contacto' })
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Llamar al jefe de biomédica')
    expect(screen.getByLabelText('Nueva nota')).toHaveValue('')
    const stored = createLocalStorageClientRepository().get('cli-004')!
    expect(stored.history.at(-1)?.text).toBe('Llamar al jefe de biomédica')
  })

  it('does not save an empty note and shows an inline error', async () => {
    const user = userEvent.setup()
    renderDetail('cli-004')
    await user.click(screen.getByRole('button', { name: 'Guardar nota' }))
    expect(screen.getByText('Escriba el contenido de la nota.')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Historial de contacto' })).getAllByRole('listitem')).toHaveLength(2)
  })

  it('advances the stage from the detail page', async () => {
    const user = userEvent.setup()
    renderDetail('cli-004')
    expect(screen.getByText('Cotización enviada', { selector: '[data-testid="stage-badge"]' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Mover a la siguiente etapa/ }))
    expect(screen.getByTestId('stage-badge')).toHaveTextContent('En evaluación')
    expect(createLocalStorageClientRepository().get('cli-004')?.stage).toBe('en-evaluacion')
  })

  it('locks closed orders', () => {
    renderDetail('cli-011')
    expect(screen.getByRole('button', { name: /Mover a la siguiente etapa/ })).toBeDisabled()
    expect(screen.getByText(/Pedido cerrado: no hay etapa siguiente/)).toBeInTheDocument()
  })

  it('logs simulated email and WhatsApp actions', async () => {
    const user = userEvent.setup()
    renderDetail('cli-004')
    await user.click(screen.getByRole('button', { name: 'Enviar cotización por correo' }))
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }))
    const list = screen.getByRole('list', { name: 'Historial de contacto' })
    expect(list).toHaveTextContent('Correo simulado enviado')
    expect(list).toHaveTextContent('WhatsApp simulado enviado')
  })

  it('shows a friendly message for an unknown client', () => {
    renderDetail('no-existe')
    expect(screen.getByText('No encontramos este cliente.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al pipeline' })).toBeInTheDocument()
  })
})
