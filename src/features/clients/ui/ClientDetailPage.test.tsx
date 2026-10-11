import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { ClientDetailPage } from './ClientDetailPage'
import { CLIENTS_STORAGE_KEY, createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'

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

  describe('when the client disappears while the page is open', () => {
    function vanish(id: string) {
      const repo = createLocalStorageClientRepository()
      const rest = repo.list().filter((c) => c.id !== id)
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(rest))
    }

    it('shows a message and a link back to the board when advancing', async () => {
      const user = userEvent.setup()
      renderDetail('cli-004')
      vanish('cli-004')
      await user.click(screen.getByRole('button', { name: /Mover a la siguiente etapa/ }))
      expect(screen.getByRole('alert')).toHaveTextContent('El cliente no existe.')
      expect(screen.getByRole('link', { name: 'Volver al tablero' })).toHaveAttribute('href', '/')
      expect(screen.queryByRole('button', { name: /Mover a la siguiente etapa/ })).not.toBeInTheDocument()
    })

    it('shows the message when saving a note', async () => {
      const user = userEvent.setup()
      renderDetail('cli-004')
      vanish('cli-004')
      await user.type(screen.getByLabelText('Nueva nota'), 'Nota huérfana')
      await user.click(screen.getByRole('button', { name: 'Guardar nota' }))
      expect(screen.getByRole('alert')).toHaveTextContent('El cliente no existe.')
      expect(screen.getByRole('link', { name: 'Volver al tablero' })).toBeInTheDocument()
    })

    it('shows the message when logging a simulated contact', async () => {
      const user = userEvent.setup()
      renderDetail('cli-004')
      vanish('cli-004')
      await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }))
      expect(screen.getByRole('alert')).toHaveTextContent('El cliente no existe.')
      expect(screen.getByRole('link', { name: 'Volver al tablero' })).toBeInTheDocument()
    })
  })

  describe('when the route id changes without unmounting the page', () => {
    function renderWithSwitcher() {
      return render(
        <MemoryRouter initialEntries={['/clientes/cli-004']}>
          <Link to="/clientes/cli-011">Ir al otro cliente</Link>
          <Routes>
            <Route path="/clientes/:id" element={<ClientDetailPage />} />
          </Routes>
        </MemoryRouter>,
      )
    }

    it('shows the new client and applies actions to it', async () => {
      const user = userEvent.setup()
      renderWithSwitcher()
      expect(screen.getByRole('heading', { level: 1, name: /Hospital Metropolitano/ })).toBeInTheDocument()
      await user.click(screen.getByRole('link', { name: 'Ir al otro cliente' }))
      expect(screen.getByRole('heading', { level: 1, name: /Cruz Roja – Comité de Liberia/ })).toBeInTheDocument()
      await user.type(screen.getByLabelText('Nueva nota'), 'Nota del segundo cliente')
      await user.click(screen.getByRole('button', { name: 'Guardar nota' }))
      const repo = createLocalStorageClientRepository()
      expect(repo.get('cli-011')?.history.at(-1)?.text).toBe('Nota del segundo cliente')
      expect(repo.get('cli-004')?.history.some((h) => h.text === 'Nota del segundo cliente')).toBe(false)
    })

    it('resets the note draft and notices of the previous client', async () => {
      const user = userEvent.setup()
      renderWithSwitcher()
      await user.type(screen.getByLabelText('Nueva nota'), 'Borrador del primero')
      await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }))
      expect(screen.getByRole('status')).toHaveTextContent('WhatsApp simulado')
      await user.click(screen.getByRole('link', { name: 'Ir al otro cliente' }))
      expect(screen.getByLabelText('Nueva nota')).toHaveValue('')
      expect(screen.getByRole('status')).toHaveTextContent('')
    })
  })
})
