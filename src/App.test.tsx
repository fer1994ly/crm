import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App shell', () => {
  it('renders the brand and primary navigation', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('Tiancy Médica')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nuevo cliente' })).toHaveAttribute('href', '/clientes/nuevo')
    expect(screen.getByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin')
  })
})
