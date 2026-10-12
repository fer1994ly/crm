import { BUSINESS_INFO, mapsSearchUrl } from './businessInfo'

describe('businessInfo', () => {
  it('builds a Google Maps search url with the encoded address', () => {
    const url = mapsSearchUrl('Escazú, San José, Costa Rica')
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=Escaz%C3%BA%2C%20San%20Jos%C3%A9%2C%20Costa%20Rica')
  })

  it('points the maps link at the configured address in Costa Rica', () => {
    expect(BUSINESS_INFO.address).toContain('Costa Rica')
    expect(BUSINESS_INFO.mapsUrl).toBe(mapsSearchUrl(BUSINESS_INFO.address))
  })

  it('lists the four social networks with https urls', () => {
    expect(BUSINESS_INFO.socials.map((s) => s.label)).toEqual(['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp'])
    for (const social of BUSINESS_INFO.socials) expect(social.url).toMatch(/^https:\/\//)
  })
})
