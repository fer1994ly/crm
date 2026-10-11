import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NewClientPage } from './NewClientPage'
import { ClientDetailPage } from './ClientDetailPage'
import { createLocalStorageClientRepository } from '../infrastructure/localStorageClientRepository'

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/clientes/nuevo']}>
      <Routes>
        <Route path="/clientes/nuevo" element={<NewClientPage />} />
        <Route path="/clientes/:id" element={<ClientDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NewClientPage', () => {
  it('does not submit with missing required fields and shows inline errors', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Registrar cliente' }))
    expect(screen.getByText('Ingrese el nombre de la institución.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese la persona de contacto.')).toBeInTheDocument()
    expect(screen.getAllByText('Ingrese un teléfono o un correo electrónico.').length).toBeGreaterThan(0)
    expect(screen.getByText('Ingrese el producto de interés.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese una cantidad entera mayor que 0.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Institución/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/Institución/)).toHaveFocus()
    expect(createLocalStorageClientRepository().list()).toHaveLength(12)
  })

  it('shows format errors for invalid email and quantity', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/Correo/), 'sin-arroba')
    await user.type(screen.getByLabelText(/Cantidad/), '0')
    await user.click(screen.getByRole('button', { name: 'Registrar cliente' }))
    expect(screen.getByText('Ingrese un correo válido, por ejemplo nombre@institucion.cr.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese una cantidad entera mayor que 0.')).toBeInTheDocument()
  })

  it('creates the client at Nuevo contacto and opens its detail', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/Institución/), 'Clínica Horizonte – Alajuela')
    await user.type(screen.getByLabelText(/Persona de contacto/), 'Marta Solís')
    await user.type(screen.getByLabelText(/Teléfono/), '2441-8899')
    await user.type(screen.getByLabelText(/Producto de interés/), 'Oxímetros de pulso')
    await user.type(screen.getByLabelText(/Cantidad/), '8')
    await user.click(screen.getByRole('button', { name: 'Registrar cliente' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Clínica Horizonte – Alajuela' })).toBeInTheDocument()
    expect(screen.getByTestId('stage-badge')).toHaveTextContent('Nuevo contacto')
    const stored = createLocalStorageClientRepository().list()
    expect(stored).toHaveLength(13)
    expect(stored.at(-1)?.quantity).toBe(8)
  })
})
