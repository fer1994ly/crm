import { expect, type Page } from '@playwright/test'

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

/** On mobile the board shows one stage at a time behind tabs; on desktop all columns are visible. */
export async function openStage(page: Page, label: string) {
  const tab = page.getByRole('tab', { name: new RegExp(label) })
  if (await tab.isVisible()) await tab.click()
}
