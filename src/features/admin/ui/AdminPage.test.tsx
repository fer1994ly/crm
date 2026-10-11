import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminPage } from './AdminPage'
import { CLIENTS_STORAGE_KEY, createLocalStorageClientRepository } from '../../clients/infrastructure/localStorageClientRepository'

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  )
}

async function unlock(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Contraseña'), 'tiancy2026')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('AdminPage', () => {
  it('asks for a password and renders no contact data before unlocking', () => {
    renderAdmin()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.queryByText(/Clínica Santa Lucía/)).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Contactos' })).not.toBeInTheDocument()
    // The contacts are not even loaded: the repository was never read, so nothing was seeded.
    expect(localStorage.getItem(CLIENTS_STORAGE_KEY)).toBeNull()
  })

  it('rejects a wrong password', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await user.type(screen.getByLabelText('Contraseña'), 'equivocada')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(screen.getByText('Contraseña incorrecta.')).toBeInTheDocument()
    expect(screen.queryByText(/Clínica Santa Lucía/)).not.toBeInTheDocument()
  })

  it('lists every contact with its stage after unlocking', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await unlock(user)
    const rows = within(screen.getByRole('list', { name: 'Contactos' })).getAllByRole('listitem')
    expect(rows).toHaveLength(12)
    expect(rows[0]).toHaveTextContent('Clínica Santa Lucía')
    expect(rows[0]).toHaveTextContent('Nuevo contacto')
    expect(sessionStorage.getItem('tiancy-crm:v1:admin-unlocked')).toBe('1')
  })

  it('stays unlocked for the session and locks on demand', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAdmin()
    await unlock(user)
    unmount()
    renderAdmin()
    expect(screen.getByRole('list', { name: 'Contactos' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bloquear panel' }))
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Contactos' })).not.toBeInTheDocument()
  })

  it('resets demo data only after confirming in the UI', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await unlock(user)
    const repo = createLocalStorageClientRepository()
    repo.save({ ...repo.list()[0], stage: 'pedido-cerrado' })

    await user.click(screen.getByRole('button', { name: 'Restablecer datos de ejemplo' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Se perderán los cambios')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(repo.list()[0].stage).toBe('pedido-cerrado')

    await user.click(screen.getByRole('button', { name: 'Restablecer datos de ejemplo' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sí, restablecer' }))
    expect(repo.list()[0].stage).toBe('nuevo-contacto')
    expect(screen.getByRole('status')).toHaveTextContent('Datos de ejemplo restablecidos')
    const rows = within(screen.getByRole('list', { name: 'Contactos' })).getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('Nuevo contacto')
  })
})
