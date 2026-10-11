import type { StageId } from '../../pipeline/domain/stage'
import type { Client, HistoryEntry, HistoryKind } from './client'

type RawHistory = [kind: HistoryKind, at: string, text: string]

interface RawClient {
  institution: string
  contactName: string
  phone: string
  email: string
  product: string
  quantity: number
  estimatedValueCrc: number
  stage: StageId
  history: RawHistory[]
}

const RAW_CLIENTS: RawClient[] = [
  {
    institution: 'Clínica Santa Lucía – Heredia',
    contactName: 'Dra. Mariana Quesada',
    phone: '+506 2261-4410',
    email: 'compras@clinicasantalucia.cr',
    product: 'Desfibrilador externo automático (DEA)',
    quantity: 3,
    estimatedValueCrc: 5400000,
    stage: 'nuevo-contacto',
    history: [
      ['call', '2026-10-06T16:20:00.000Z', 'Llamada entrante: solicitan información sobre DEA para sala de espera y consulta externa.'],
      ['email', '2026-10-07T14:05:00.000Z', 'Se envió la ficha técnica del DEA con certificaciones vigentes.'],
    ],
  },
  {
    institution: 'EBAIS Desamparados Sur',
    contactName: 'Lic. Rodrigo Mena',
    phone: '+506 2259-7733',
    email: 'rmena@ebais-desamparados.go.cr',
    product: 'Botiquines de primeros auxilios',
    quantity: 18,
    estimatedValueCrc: 1260000,
    stage: 'nuevo-contacto',
    history: [
      ['email', '2026-10-08T15:40:00.000Z', 'Solicitud de cotización recibida por correo para botiquines de pared y de emergencia.'],
    ],
  },
  {
    institution: 'Cruz Roja – Comité de Alajuela',
    contactName: 'Sra. Karla Jiménez',
    phone: '+506 2441-0120',
    email: 'logistica@cruzroja-alajuela.cr',
    product: 'Camillas de rescate plegables',
    quantity: 6,
    estimatedValueCrc: 2100000,
    stage: 'nuevo-contacto',
    history: [
      ['visit', '2026-10-09T17:00:00.000Z', 'Visita a la base del comité para revisar espacio de almacenamiento y unidades móviles.'],
    ],
  },
  {
    institution: 'Hospital Metropolitano – Lindora',
    contactName: 'Ing. Esteban Rojas',
    phone: '+506 2205-8800',
    email: 'biomedica@hmetropolitano.cr',
    product: 'Monitores de signos vitales multiparámetro',
    quantity: 10,
    estimatedValueCrc: 24500000,
    stage: 'cotizacion-enviada',
    history: [
      ['visit', '2026-09-22T15:00:00.000Z', 'Visita técnica a UCI y salas de observación para definir parámetros requeridos.'],
      ['email', '2026-09-29T20:30:00.000Z', 'Cotización formal enviada con tres opciones de configuración.'],
    ],
  },
  {
    institution: 'Centro Médico Escazú',
    contactName: 'Dra. Paula Víquez',
    phone: '+506 2288-3045',
    email: 'direccion@cmescazu.cr',
    product: 'Electrocardiógrafo de 12 derivaciones',
    quantity: 2,
    estimatedValueCrc: 6800000,
    stage: 'cotizacion-enviada',
    history: [
      ['call', '2026-09-30T16:10:00.000Z', 'Llamada para confirmar requerimientos de interpretación automática.'],
      ['email', '2026-10-02T19:45:00.000Z', 'Se envió cotización con capacitación incluida para el personal.'],
    ],
  },
  {
    institution: 'Clínica Dental Sonrisa Perfecta – Cartago',
    contactName: 'Dr. Andrés Calderón',
    phone: '+506 2551-6290',
    email: 'andres@sonrisaperfecta.cr',
    product: 'Autoclave de mesa clase B',
    quantity: 1,
    estimatedValueCrc: 3200000,
    stage: 'cotizacion-enviada',
    history: [
      ['whatsapp', '2026-10-03T21:15:00.000Z', 'Consulta por WhatsApp sobre capacidad de la cámara y ciclos de esterilización.'],
      ['email', '2026-10-05T14:30:00.000Z', 'Cotización enviada con opción de financiamiento a 12 meses.'],
    ],
  },
  {
    institution: 'Laboratorio Clínico San José Centro',
    contactName: 'Licda. Natalia Chaves',
    phone: '+506 2223-9514',
    email: 'natalia.chaves@labsanjosecentro.cr',
    product: 'Oxímetros de pulso de mesa y portátiles',
    quantity: 12,
    estimatedValueCrc: 1980000,
    stage: 'en-evaluacion',
    history: [
      ['email', '2026-09-18T15:00:00.000Z', 'Cotización enviada para oxímetros de mesa y de dedo.'],
      ['call', '2026-09-26T17:25:00.000Z', 'Seguimiento: el comité técnico compara dos marcas y revisará muestras.'],
      ['visit', '2026-10-04T16:00:00.000Z', 'Se entregaron equipos de demostración para pruebas durante una semana.'],
    ],
  },
  {
    institution: 'Fisioterapia Integral Pura Vida – Curridabat',
    contactName: 'Lic. Daniel Arias',
    phone: '+506 2272-4408',
    email: 'contacto@fisiopuravida.cr',
    product: 'Camillas de tratamiento eléctricas',
    quantity: 4,
    estimatedValueCrc: 7600000,
    stage: 'en-evaluacion',
    history: [
      ['visit', '2026-09-25T16:30:00.000Z', 'Visita al consultorio para medir espacios y definir altura y capacidad de carga.'],
      ['email', '2026-10-01T15:20:00.000Z', 'Cotización enviada; el cliente evalúa dos configuraciones de cabecera.'],
    ],
  },
  {
    institution: 'Clínica Bíblica Dental – San Pedro',
    contactName: 'Dra. Lucía Barrantes',
    phone: '+506 2253-1176',
    email: 'lbarrantes@clinicabiblicadental.cr',
    product: 'Autoclaves de vapor con registro de ciclos',
    quantity: 2,
    estimatedValueCrc: 8900000,
    stage: 'negociacion',
    history: [
      ['email', '2026-09-10T15:00:00.000Z', 'Cotización enviada para dos autoclaves con trazabilidad de ciclos.'],
      ['call', '2026-09-24T18:00:00.000Z', 'Solicitaron descuento por volumen y extensión de garantía.'],
      ['email', '2026-10-06T19:10:00.000Z', 'Contrapropuesta enviada: 24 meses de garantía y mantenimiento preventivo.'],
    ],
  },
  {
    institution: 'Hospital de la Anexión – Servicio de Emergencias',
    contactName: 'Dr. Mauricio Salas',
    phone: '+506 2685-5100',
    email: 'proveeduria@hospitalanexion.go.cr',
    product: 'Sillas de ruedas de traslado',
    quantity: 25,
    estimatedValueCrc: 6250000,
    stage: 'negociacion',
    history: [
      ['email', '2026-09-05T15:00:00.000Z', 'Cotización entregada a proveeduría para compra por demanda.'],
      ['call', '2026-09-28T16:45:00.000Z', 'Proveeduría pidió ajustar entregas en dos lotes.'],
      ['note', '2026-10-07T20:00:00.000Z', 'Pendiente confirmación de partida presupuestaria; se acordó nueva llamada el 14 de octubre.'],
    ],
  },
  {
    institution: 'Cruz Roja – Comité de Liberia',
    contactName: 'Sr. Jorge Alpízar',
    phone: '+506 2666-0314',
    email: 'jalpizar@cruzroja-liberia.cr',
    product: 'Desfibriladores externos automáticos (DEA)',
    quantity: 4,
    estimatedValueCrc: 7200000,
    stage: 'pedido-cerrado',
    history: [
      ['email', '2026-08-12T15:00:00.000Z', 'Cotización enviada para cuatro DEA con maletín de transporte.'],
      ['call', '2026-08-27T17:00:00.000Z', 'Aprobación del comité directivo confirmada.'],
      ['note', '2026-09-15T19:30:00.000Z', 'Orden de compra recibida; entrega programada con capacitación de uso.'],
    ],
  },
  {
    institution: 'Clínica Cristiana de Salud – Pérez Zeledón',
    contactName: 'Licda. Gabriela Solano',
    phone: '+506 2771-2965',
    email: 'gsolano@clinicacristianasalud.cr',
    product: 'Monitores de signos vitales de cabecera',
    quantity: 5,
    estimatedValueCrc: 9750000,
    stage: 'pedido-cerrado',
    history: [
      ['visit', '2026-07-30T16:00:00.000Z', 'Visita de evaluación en hospitalización y sala de recuperación.'],
      ['email', '2026-08-14T15:30:00.000Z', 'Cotización enviada con soporte técnico local.'],
      ['note', '2026-09-20T18:15:00.000Z', 'Pedido cerrado y facturado; instalación coordinada con el área de mantenimiento.'],
    ],
  },
]

export function createSeedClients(): Client[] {
  return RAW_CLIENTS.map((raw, index) => {
    const id = `cli-${String(index + 1).padStart(3, '0')}`
    const history: HistoryEntry[] = raw.history.map(([kind, at, text], i) => ({
      id: `${id}-h${i + 1}`,
      kind,
      at,
      text,
    }))
    return {
      id,
      institution: raw.institution,
      contactName: raw.contactName,
      phone: raw.phone,
      email: raw.email,
      product: raw.product,
      quantity: raw.quantity,
      estimatedValueCrc: raw.estimatedValueCrc,
      stage: raw.stage,
      history,
    }
  })
}
