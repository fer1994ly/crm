const crc = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})

export function formatCrc(amount: number): string {
  return crc.format(amount)
}
