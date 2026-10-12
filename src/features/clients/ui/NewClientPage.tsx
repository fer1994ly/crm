import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientRepository } from '../../../app/repositories'
import { createClient } from '../application/createClient'
import { CLIENT_FIELDS, ClientFormFields } from './ClientFormFields'
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
    const first = CLIENT_FIELDS.find((f) => result.errors[f.name])
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
        <ClientFormFields
          idPrefix="campo"
          values={values}
          errors={errors}
          onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
          registerRef={(name, el) => {
            refs.current[name] = el
          }}
        />
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
