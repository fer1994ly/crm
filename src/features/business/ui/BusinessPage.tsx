import { Link } from 'react-router-dom'
import { BUSINESS_INFO } from '../domain/businessInfo'

const externalLink = 'inline-flex min-h-11 items-center font-semibold text-brand underline'

/** Public company page: it shows no contact data, so it is reachable without the access password. */
export function BusinessPage() {
  const info = BUSINESS_INFO
  return (
    <div className="min-h-dvh">
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <span className="font-heading text-lg font-bold tracking-tight">{info.name}</span>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-white/10"
          >
            Ir al CRM
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h1 className="text-2xl text-brand">Sobre {info.name}</h1>
        <p>{info.summary}</p>

        <section aria-labelledby="que-hacemos" className="rounded-lg border border-line bg-surface p-4">
          <h2 id="que-hacemos" className="text-lg text-brand">
            Qué hacemos
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {info.activities.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="como-llegar" className="rounded-lg border border-line bg-surface p-4">
          <h2 id="como-llegar" className="text-lg text-brand">
            Cómo llegar
          </h2>
          <p className="mt-2 break-words text-sm">{info.address}</p>
          <a href={info.mapsUrl} target="_blank" rel="noopener noreferrer" className={externalLink}>
            Ver en Google Maps
          </a>
        </section>

        <section aria-labelledby="contacto" className="rounded-lg border border-line bg-surface p-4">
          <h2 id="contacto" className="text-lg text-brand">
            Horario y contacto
          </h2>
          <p className="mt-2 text-sm">{info.hours}</p>
          <p className="mt-1 text-sm">
            Teléfono:{' '}
            <a href={`tel:${info.phone.replace(/[^+\d]/g, '')}`} className="font-medium text-brand underline">
              {info.phone}
            </a>
          </p>
        </section>

        <section aria-labelledby="redes" className="rounded-lg border border-line bg-surface p-4">
          <h2 id="redes" className="text-lg text-brand">
            Redes sociales
          </h2>
          <ul className="mt-1 flex flex-wrap gap-x-5">
            {info.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} (se abre en una pestaña nueva)`}
                  className={externalLink}
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
