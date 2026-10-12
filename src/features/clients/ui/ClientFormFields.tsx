import type { NewClientErrors, NewClientField, NewClientInput } from '../domain/newClient'

interface FieldConfig {
  name: NewClientField
  label: string
  required: boolean
  type?: string
  inputMode?: 'numeric' | 'tel' | 'email'
  autoComplete?: string
  hint?: string
}

export const CLIENT_FIELDS: FieldConfig[] = [
  { name: 'institution', label: 'Institución', required: true, autoComplete: 'organization' },
  { name: 'contactName', label: 'Persona de contacto', required: true, autoComplete: 'name' },
  { name: 'phone', label: 'Teléfono', required: false, type: 'tel', inputMode: 'tel', autoComplete: 'tel', hint: 'Teléfono o correo: al menos uno es obligatorio.' },
  { name: 'email', label: 'Correo electrónico', required: false, type: 'email', inputMode: 'email', autoComplete: 'email' },
  { name: 'product', label: 'Producto de interés', required: true },
  { name: 'quantity', label: 'Cantidad', required: true, inputMode: 'numeric' },
  { name: 'estimatedValue', label: 'Valor estimado (₡, opcional)', required: false, inputMode: 'numeric' },
]

interface Props {
  /** Prefix that keeps element ids unique when several forms are on one page. */
  idPrefix: string
  values: NewClientInput
  errors: NewClientErrors
  onChange: (name: NewClientField, value: string) => void
  registerRef?: (name: NewClientField, element: HTMLInputElement | null) => void
}

/** Controlled inputs for the contact fields, shared by the creation form and the admin editor. */
export function ClientFormFields({ idPrefix, values, errors, onChange, registerRef }: Props) {
  return (
    <>
      {CLIENT_FIELDS.map((f) => {
        const error = errors[f.name]
        const id = `${idPrefix}-${f.name}`
        return (
          <div key={f.name}>
            <label htmlFor={id} className="block text-sm font-medium">
              {f.label}
              {f.required && <span aria-hidden="true"> *</span>}
            </label>
            <input
              id={id}
              ref={(el) => registerRef?.(f.name, el)}
              type={f.type ?? 'text'}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              required={f.required}
              value={values[f.name]}
              onChange={(e) => onChange(f.name, e.target.value)}
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
    </>
  )
}
