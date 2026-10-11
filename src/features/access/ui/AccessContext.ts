import { createContext, useContext } from 'react'

interface AccessContextValue {
  lock(): void
}

export const AccessContext = createContext<AccessContextValue | null>(null)

export function useAccess(): AccessContextValue {
  const value = useContext(AccessContext)
  if (!value) throw new Error('useAccess must be used inside <AccessGate>')
  return value
}
