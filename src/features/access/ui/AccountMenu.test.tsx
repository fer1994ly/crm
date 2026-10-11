import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../../../App'
import { createLocalStorageClientRepository } from '../../clients/infrastructure/localStorageClientRepository'

async function renderUnlocked() {
  sessionStorage.setItem('tiancy-crm:v1:access-unlocked', '1')
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })
}

describe('AccountMenu', () => {
  it('has no separate Administración tab', async () => {
    await renderUnlocked()
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument()
  })

  it('opens and closes with Escape, returning focus to the trigger', async () => {
    const user = userEvent.setup()
    await renderUnlocked()
    const trigger = screen.getByRole('button', { name: 'Cuenta' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Restablecer datos de ejemplo' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes on an outside click', async () => {
    const user = userEvent.setup()
    await renderUnlocked()
    await user.click(screen.getByRole('button', { name: 'Cuenta' }))
    await user.click(screen.getByRole('heading', { level: 1, name: 'Pipeline comercial' }))
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('resets demo data only after confirming in the UI', async () => {
    const user = userEvent.setup()
    await renderUnlocked()
    const repo = createLocalStorageClientRepository()
    repo.save({ ...repo.list()[0], stage: 'pedido-cerrado' })

    await user.click(screen.getByRole('button', { name: 'Cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Restablecer datos de ejemplo' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Se perderán los cambios')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(repo.list()[0].stage).toBe('pedido-cerrado')

    await user.click(screen.getByRole('button', { name: 'Cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Restablecer datos de ejemplo' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sí, restablecer' }))
    expect(repo.list()[0].stage).toBe('nuevo-contacto')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Datos de ejemplo restablecidos.')).toBeInTheDocument()
  })

  it('cancels the confirmation with Escape', async () => {
    const user = userEvent.setup()
    await renderUnlocked()
    await user.click(screen.getByRole('button', { name: 'Cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Restablecer datos de ejemplo' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
