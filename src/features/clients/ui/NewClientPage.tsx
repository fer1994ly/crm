import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientRepository } from '../../../app/repositories'
import { createClient } from '../application/createClient'
import type { NewClientErrors, NewClientField, NewClientInput } from '../domain/newClient'

const EMPTY: NewClientInput = {
  institution: '',
  contactName: '',
  phone: '',
  email: '',
  product: '',
  quantity: '',
  estimatedValue: '',
}

interface FieldConfig {
  name: NewClientField
  label: string
  required: boolean
  type?: string
  inputMode?: 'numeric' | 'tel' | 'email'
  autoComplete?: string
  hint?: string
}

const FIELDS: FieldConfig[] = [
  { name: 'institution', label: 'Institución', required: true, autoComplete: 'organization' },
  { name: 'contactName', label: 'Persona de contacto', required: true, autoComplete: 'name' },
  { name: 'phone', label: 'Teléfono', required: false, type: 'tel', inputMode: 'tel', autoComplete: 'tel', hint: 'Teléfono o correo: al menos uno es obligatorio.' },
  { name: 'email', label: 'Correo electrónico', required: false, type: 'email', inputMode: 'email', autoComplete: 'email' },
  { name: 'product', label: 'Producto de interés', required: true },
  { name: 'quantity', label: 'Cantidad', required: true, inputMode: 'numeric' },
  { name: 'estimatedValue', label: 'Valor estimado (₡, opcional)', required: false, inputMode: 'numeric' },
]

export function NewClientPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<NewClientInput>(EMPTY)
  const [errors, setErrors] = useState<NewClientErrors>({})
  const refs = useRef<Partial<Record<NewClientField, HTMLInputElement | null>>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = createClient(getClientRepository(), values)
    if (result.ok) {
      navigate(`/clientes/${result.client.id}`)
      return
    }
    setErrors(result.errors)
    const first = FIELDS.find((f) => result.errors[f.name])
    if (first) refs.current[first.name]?.focus()
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/" className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline">
        ← Volver al pipeline
      </Link>
      <h1 className="text-2xl text-brand">Nuevo cliente</h1>
      <p className="mt-1 text-sm text-muted">
        El cliente se crea en la etapa «Nuevo contacto». Los campos con * son obligatorios.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4 rounded-lg border border-line bg-surface p-4">
        {FIELDS.map((f) => {
          const error = errors[f.name]
          const id = `campo-${f.name}`
          return (
            <div key={f.name}>
              <label htmlFor={id} className="block text-sm font-medium">
                {f.label}
                {f.required && <span aria-hidden="true"> *</span>}
              </label>
              <input
                id={id}
                ref={(el) => {
                  refs.current[f.name] = el
                }}
                type={f.type ?? 'text'}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                required={f.required}
                value={values[f.name]}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : f.hint ? `${id}-hint` : undefined}
                className={`mt-1 min-h-11 w-full rounded-md border p-2 text-base ${error ? 'border-red-700' : 'border-line'}`}
              />
              {f.hint && !error && (
                <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
                  {f.hint}
                </p>
              )}
              {error && (
                <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
          )
        })}
        <button
          type="submit"
          className="min-h-11 w-full rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Registrar cliente
        </button>
      </form>
    </div>
  )
}
