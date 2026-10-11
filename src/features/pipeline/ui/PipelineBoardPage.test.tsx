import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PipelineBoardPage } from './PipelineBoardPage'
import { CLIENTS_STORAGE_KEY } from '../../clients/infrastructure/localStorageClientRepository'

function renderBoard() {
  return render(
    <MemoryRouter>
      <PipelineBoardPage />
    </MemoryRouter>,
  )
}

describe('PipelineBoardPage', () => {
  it('shows the five stages in order with counts', () => {
    renderBoard()
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent)
    expect(tabs).toHaveLength(5)
    expect(tabs[0]).toContain('Nuevo contacto')
    expect(tabs[4]).toContain('Pedido cerrado')
    expect(tabs.join(' ')).toMatch(/3/)
  })

  it('renders client card data', () => {
    renderBoard()
    const card = screen.getByRole('article', { name: /Clínica Santa Lucía/ })
    expect(within(card).getByText(/Desfibrilador|desfibrilador/)).toBeInTheDocument()
    expect(within(card).getByText(/Cantidad/)).toBeInTheDocument()
    expect(within(card).getByText(/₡/)).toBeInTheDocument()
    expect(within(card).getByText(/Última actividad/)).toBeInTheDocument()
  })

  it('moves a client to the next stage without reloading and persists it', async () => {
    const user = userEvent.setup()
    renderBoard()
    const before = screen.getByRole('region', { name: /Nuevo contacto/ })
    const card = within(before).getAllByRole('article')[0]
    const name = card.getAttribute('aria-label')!
    await user.click(within(card).getByRole('button', { name: /Mover a la siguiente etapa/ }))
    const quoted = screen.getByRole('region', { name: /Cotización enviada/ })
    expect(within(quoted).getByRole('article', { name })).toBeInTheDocument()
    expect(within(before).queryByRole('article', { name })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cotización enviada')
    expect(localStorage.getItem(CLIENTS_STORAGE_KEY)).toContain('cotizacion-enviada')
  })

  it('disables the move button for closed orders and explains why', () => {
    renderBoard()
    const closed = screen.getByRole('region', { name: /Pedido cerrado/ })
    const card = within(closed).getAllByRole('article')[0]
    expect(within(card).getByRole('button', { name: /Mover a la siguiente etapa/ })).toBeDisabled()
    expect(within(card).getByText(/Pedido cerrado: no hay etapa siguiente/)).toBeInTheDocument()
  })
})
