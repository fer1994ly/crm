import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, unlock } from './helpers'

const NOTICE = /Tu navegador está bloqueando el almacenamiento local/

test('shows no notice when storage works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible()
  await expect(page.getByText(NOTICE)).toHaveCount(0)
})

test.describe('with localStorage blocked', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = function () {
        throw new DOMException('blocked', 'SecurityError')
      }
    })
  })

  test('warns on the login screen without hiding the form', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('status').filter({ hasText: NOTICE })).toBeVisible()
    await expect(page.getByLabel('Clave de acceso')).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test('warns inside the app and the app keeps working in memory', async ({ page }) => {
    await page.goto('/')
    await unlock(page)
    await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: NOTICE })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })
})
