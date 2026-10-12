import { render, screen } from '@testing-library/react'
import { StorageNotice } from './StorageNotice'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('StorageNotice', () => {
  it('renders nothing when local storage works', () => {
    render(<StorageNotice />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('warns, without blocking, that changes will not be saved when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    render(<StorageNotice />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Tu navegador está bloqueando el almacenamiento local: los cambios no se guardarán al cerrar o recargar la página.',
    )
  })
})
