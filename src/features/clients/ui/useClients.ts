import { useCallback, useState } from 'react'
import { getClientRepository } from '../../../app/repositories'
import type { Client } from '../domain/client'

export function useClients() {
  const [clients, setClients] = useState<Client[]>(() => getClientRepository().list())
  const refresh = useCallback(() => setClients(getClientRepository().list()), [])
  return { clients, refresh }
}
