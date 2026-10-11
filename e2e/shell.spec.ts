import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, resetAndUnlock } from './helpers'

test('home loads with brand and no horizontal overflow once unlocked', async ({ page }) => {
  await resetAndUnlock(page, '/')
  await expect(page.getByText('Tiancy Médica').first()).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})
