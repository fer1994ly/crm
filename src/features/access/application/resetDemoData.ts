import type { ClientRepository } from '../../clients/domain/clientRepository'

export function resetDemoData(repo: ClientRepository): void {
  repo.resetToSeed()
}
