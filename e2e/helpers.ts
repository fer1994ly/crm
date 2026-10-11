import { expect, type Page } from '@playwright/test'

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

/** On mobile the board shows one stage at a time behind tabs; on desktop all columns are visible. */
export async function openStage(page: Page, label: string) {
  // The board is a lazy chunk: wait for it before deciding whether stage tabs exist.
  await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
  const tab = page.getByRole('tab', { name: new RegExp(label) })
  if (await tab.isVisible()) await tab.click()
}

export const ACCESS_PASSWORD = 'tiancy2026'
export const CLIENTS_KEY = 'tiancy-crm:v1:clients'

/** Fills the login screen and submits it. */
export async function unlock(page: Page, password = ACCESS_PASSWORD) {
  await page.getByLabel('Clave de acceso').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
}

/** Starts from an empty browser, opens `path` and passes the access screen. */
export async function resetAndUnlock(page: Page, path = '/') {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto(path)
  await unlock(page)
}

export async function openAccountMenu(page: Page) {
  await page.getByRole('button', { name: 'Cuenta' }).click()
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible()
}
