import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, openStage, resetAndUnlock } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetAndUnlock(page, '/')
})

test('board has no horizontal overflow and primary actions are usable', async ({ page }) => {
  await expectNoHorizontalOverflow(page)
  const add = page.getByRole('link', { name: 'Agregar cliente' })
  await expect(add).toBeVisible()
  const box = await add.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
  const move = page.getByRole('button', { name: /Mover a la siguiente etapa/ }).first()
  await move.scrollIntoViewIfNeeded()
  await expect(move).toBeVisible()
  await expect(move).toBeEnabled()
})

test('moves a client to the next stage without reloading the page', async ({ page }) => {
  await page.evaluate(() => {
    ;(window as unknown as { __noReload: boolean }).__noReload = true
  })
  await page.getByRole('button', { name: 'Mover a la siguiente etapa: Clínica Santa Lucía – Heredia' }).click()
  await expect(page.getByRole('status')).toContainText('Cotización enviada')
  await openStage(page, 'Cotización enviada')
  await expect(page.getByRole('article', { name: 'Clínica Santa Lucía – Heredia' })).toBeVisible()
  const survived = await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)
  expect(survived).toBe(true)
})

test('keeps the new stage after reloading', async ({ page }) => {
  await page.getByRole('button', { name: 'Mover a la siguiente etapa: EBAIS Desamparados Sur' }).click()
  await page.reload()
  await openStage(page, 'Cotización enviada')
  await expect(page.getByRole('article', { name: 'EBAIS Desamparados Sur' })).toBeVisible()
})

test('closed orders cannot move', async ({ page }) => {
  await openStage(page, 'Pedido cerrado')
  const card = page.getByRole('article', { name: 'Cruz Roja – Comité de Liberia' })
  await expect(card.getByRole('button', { name: /Mover a la siguiente etapa/ })).toBeDisabled()
  await expect(card.getByText('Pedido cerrado: no hay etapa siguiente.')).toBeVisible()
})
