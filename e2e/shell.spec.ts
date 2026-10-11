import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow } from './helpers'

test('home loads with brand and no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Tiancy Médica').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
})
