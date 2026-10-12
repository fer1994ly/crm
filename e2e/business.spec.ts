import { expect, test } from '@playwright/test'
import { CLIENTS_KEY, expectNoHorizontalOverflow, resetAndUnlock } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})

test('the business page is reachable from the login screen without the password', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sobre Tiancy Médica' }).click()
  await expect(page).toHaveURL(/\/empresa$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Sobre Tiancy Médica' })).toBeVisible()
  await expect(page.getByLabel('Clave de acceso')).toHaveCount(0)
  await expect(page.getByText('Clínica Santa Lucía')).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), CLIENTS_KEY)).toBeNull()
})

test('shows a Google Maps link and the social links, with no horizontal overflow', async ({ page }) => {
  await page.goto('/empresa')
  const maps = page.getByRole('link', { name: /Ver en Google Maps/ })
  await expect(maps).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=.*Costa%20Rica$/)
  await expect(maps).toHaveAttribute('target', '_blank')
  await expect(maps).toHaveAttribute('rel', 'noopener noreferrer')
  for (const name of ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp']) {
    const link = page.getByRole('link', { name: new RegExp(name) })
    await expect(link).toHaveAttribute('href', /^https:\/\//)
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
  await expectNoHorizontalOverflow(page)
})

test('is reachable from the header once unlocked and returns to the CRM', async ({ page }) => {
  await resetAndUnlock(page, '/')
  await page.getByRole('link', { name: 'Empresa' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Sobre Tiancy Médica' })).toBeVisible()
  await page.getByRole('link', { name: 'Ir al CRM' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
})

test('the header with the new links has no horizontal overflow', async ({ page }) => {
  await resetAndUnlock(page, '/')
  await expectNoHorizontalOverflow(page)
})
