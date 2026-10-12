/**
 * EXAMPLE DATA: plausible but not real. Replace these values with the company's real details
 * (see "Business information page" in the README). This is the only place the page reads from.
 */

export interface SocialLink {
  label: string
  url: string
}

export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

const address = 'Avenida Escazú, Torre Lexus, piso 3, Escazú, San José, Costa Rica'

export const BUSINESS_INFO = {
  name: 'Tiancy Médica',
  summary:
    'Somos un proveedor de equipo médico para clínicas, hospitales, EBAIS, laboratorios y comités de la Cruz Roja en todo Costa Rica.',
  activities: [
    'Venta de equipo médico y de diagnóstico para instituciones de salud.',
    'Cotizaciones a la medida, con seguimiento comercial hasta la entrega del pedido.',
    'Instalación, capacitación del personal y soporte posventa.',
  ],
  address,
  mapsUrl: mapsSearchUrl(address),
  hours: 'Lunes a viernes, 8:00 a. m. a 5:00 p. m.',
  phone: '+506 2288-4400',
  email: 'info@tiancymedica.example',
  socials: [
    { label: 'Facebook', url: 'https://www.facebook.com/tiancymedica' },
    { label: 'Instagram', url: 'https://www.instagram.com/tiancymedica' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/tiancy-medica' },
    { label: 'WhatsApp', url: 'https://wa.me/50622884400' },
  ] satisfies SocialLink[],
}
