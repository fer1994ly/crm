import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App shell', () => {
  it('renders the brand and primary navigation once unlocked', async () => {
    sessionStorage.setItem('tiancy-crm:v1:access-unlocked', '1')
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('Tiancy Médica')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nuevo cliente' })).toHaveAttribute('href', '/clientes/nuevo')
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeInTheDocument()
  })
})
