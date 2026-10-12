import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BusinessPage } from './BusinessPage'
import { BUSINESS_INFO } from '../domain/businessInfo'

function renderPage() {
  return render(
    <MemoryRouter>
      <BusinessPage />
    </MemoryRouter>,
  )
}

describe('BusinessPage', () => {
  it('describes what the company does', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Sobre Tiancy Médica' })).toBeInTheDocument()
    expect(screen.getAllByText(/equipo médico/i).length).toBeGreaterThan(0)
  })

  it('shows the address with a Google Maps link that opens safely in a new tab', () => {
    renderPage()
    expect(screen.getByText(BUSINESS_INFO.address)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Ver en Google Maps/ })
    expect(link).toHaveAttribute('href', BUSINESS_INFO.mapsUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows hours, phone and the social network links', () => {
    renderPage()
    expect(screen.getByText(BUSINESS_INFO.hours)).toBeInTheDocument()
    for (const social of BUSINESS_INFO.socials) {
      const link = screen.getByRole('link', { name: new RegExp(social.label) })
      expect(link).toHaveAttribute('href', social.url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('shows no client data', () => {
    renderPage()
    expect(screen.queryByText(/Clínica Santa Lucía/)).not.toBeInTheDocument()
  })
})
