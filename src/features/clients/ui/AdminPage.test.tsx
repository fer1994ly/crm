import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminPage } from './AdminPage'
import { getClientRepository } from '../../../app/repositories'

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  )
}

describe('AdminPage', () => {
  it('lists every contact of every stage with stage and contact info', () => {
    renderAdmin()
    expect(screen.getByRole('heading', { level: 1, name: 'Administración' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(12)
    const card = screen.getByRole('article', { name: /Clínica Santa Lucía/ })
    expect(within(card).getByTestId('stage-badge')).toBeInTheDocument()
    expect(within(card).getByText('Teléfono')).toBeInTheDocument()
    expect(within(card).getByText('Correo')).toBeInTheDocument()
    const stages = screen.getAllByTestId('stage-badge').map((b) => b.textContent)
    expect(new Set(stages).size).toBe(5)
  })

  it('blocks invalid edits with inline Spanish errors and persists nothing', async () => {
    const user = userEvent.setup()
    renderAdmin()
    const before = getClientRepository().list()[0]
    await user.click(screen.getByRole('button', { name: `Editar ${before.institution}` }))
    const institution = screen.getByLabelText(/Institución/)
    await user.clear(institution)
    await user.clear(screen.getByLabelText(/Cantidad/))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('Ingrese el nombre de la institución.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese una cantidad entera mayor que 0.')).toBeInTheDocument()
    expect(institution).toHaveAttribute('aria-invalid', 'true')
    expect(getClientRepository().get(before.id)).toEqual(before)
  })

  it('saves a valid edit, keeps stage and history, and cancel discards changes', async () => {
    const user = userEvent.setup()
    renderAdmin()
    const before = getClientRepository().list()[0]
    await user.click(screen.getByRole('button', { name: `Editar ${before.institution}` }))
    await user.type(screen.getByLabelText(/Institución/), ' Norte')
    await user.click(screen.getByRole('button', { name: 'Cancelar edición' }))
    expect(getClientRepository().get(before.id)).toEqual(before)

    await user.click(screen.getByRole('button', { name: `Editar ${before.institution}` }))
    const field = screen.getByLabelText(/Institución/)
    await user.clear(field)
    await user.type(field, 'Clínica Renombrada')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByRole('article', { name: 'Clínica Renombrada' })).toBeInTheDocument()
    const after = getClientRepository().get(before.id)!
    expect(after.institution).toBe('Clínica Renombrada')
    expect(after.stage).toBe(before.stage)
    expect(after.history).toEqual(before.history)
  })

  it('asks for an in-page confirmation before deleting', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
    renderAdmin()
    const target = getClientRepository().list()[1]
    await user.click(screen.getByRole('button', { name: `Eliminar ${target.institution}` }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(target.institution)
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(getClientRepository().get(target.id)).toBeDefined()

    await user.click(screen.getByRole('button', { name: `Eliminar ${target.institution}` }))
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(screen.queryByRole('article', { name: target.institution })).not.toBeInTheDocument()
    expect(getClientRepository().get(target.id)).toBeUndefined()
    expect(screen.getAllByRole('article')).toHaveLength(11)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('shows an empty state when there are no contacts', async () => {
    const user = userEvent.setup()
    renderAdmin()
    for (const client of getClientRepository().list()) {
      await user.click(screen.getByRole('button', { name: `Eliminar ${client.institution}` }))
      await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    }
    expect(screen.getByText('No hay contactos registrados.')).toBeInTheDocument()
  })
})
