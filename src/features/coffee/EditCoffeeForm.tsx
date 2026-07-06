import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Coffee } from '../../lib/useCoffees'
import { PROCESS_OPTIONS, ROAST_OPTIONS } from '../../lib/labels'

type CoffeeFields = {
  roaster_name: string
  coffee_name: string
  origin_country: string
  origin_region: string
  producer: string
  farm: string
  process: string
  process_detail: string
  roaster_stated_roast_level: string
  variety: string
  elevation_masl: string
  roaster_tasting_notes: string
}

function fieldsFromCoffee(coffee: Coffee): CoffeeFields {
  return {
    roaster_name: coffee.roaster_name ?? '',
    coffee_name: coffee.coffee_name ?? '',
    origin_country: coffee.origin_country ?? '',
    origin_region: coffee.origin_region ?? '',
    producer: coffee.producer ?? '',
    farm: coffee.farm ?? '',
    process: coffee.process ?? '',
    process_detail: coffee.process_detail ?? '',
    roaster_stated_roast_level:
      coffee.roaster_stated_roast_level && coffee.roaster_stated_roast_level !== 'unspecified'
        ? coffee.roaster_stated_roast_level
        : '',
    variety: coffee.variety?.length ? coffee.variety.join(', ') : '',
    elevation_masl: coffee.elevation_masl != null ? String(coffee.elevation_masl) : '',
    roaster_tasting_notes: coffee.roaster_tasting_notes_raw?.length
      ? coffee.roaster_tasting_notes_raw.join(', ')
      : '',
  }
}

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

const s = {
  container: { marginTop: '3rem', maxWidth: '600px' } as const,
  backLink: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: espresso,
    opacity: 0.6,
    cursor: 'pointer' as const,
    marginBottom: '1.5rem',
    display: 'block',
  } as const,
  eyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: ember,
    margin: '0 0 0.35rem',
  } as const,
  heading: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '2rem',
    fontStyle: 'italic' as const,
    margin: '0 0 0.5rem',
    letterSpacing: '-0.02em',
    color: espresso,
  } as const,
  subheading: {
    fontSize: '0.9rem',
    opacity: 0.6,
    margin: '0 0 2rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    color: espresso,
  } as const,
  form: { display: 'grid', gap: '1.25rem' } as const,
  fieldGroup: { display: 'grid', gap: '0.35rem' } as const,
  label: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    opacity: 0.55,
    color: espresso,
  } as const,
  required: { color: ember },
  input: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid rgba(30, 20, 16, 0.25)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: espresso,
    width: '100%',
    boxSizing: 'border-box' as const,
  } as const,
  select: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid rgba(30, 20, 16, 0.25)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: espresso,
    width: '100%',
    cursor: 'pointer' as const,
  } as const,
  primaryButton: {
    padding: '0.85rem 1.75rem',
    backgroundColor: ember,
    color: cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
    marginTop: '0.5rem',
  } as const,
  disabledButton: { opacity: 0.5, cursor: 'not-allowed' as const },
  helperText: {
    fontSize: '0.8rem',
    opacity: 0.55,
    fontStyle: 'italic' as const,
    fontFamily: 'Geist, system-ui, sans-serif',
    color: espresso,
  } as const,
  error: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: ember,
    margin: 0,
  } as const,
}

type Props = {
  coffee: Coffee
  onCancel: () => void
  onSaved: () => void
}

export function EditCoffeeForm({ coffee, onCancel, onSaved }: Props) {
  const [fields, setFields] = useState<CoffeeFields>(() => fieldsFromCoffee(coffee))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave =
    fields.roaster_name &&
    fields.coffee_name &&
    fields.origin_country &&
    fields.process &&
    fields.roaster_stated_roast_level

  const handleSave = async () => {
    setError(null)
    if (!canSave) {
      setError('Fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      const variety = fields.variety
        ? fields.variety.split(',').map((v) => v.trim()).filter(Boolean)
        : null
      const tastingNotesArr = fields.roaster_tasting_notes
        ? fields.roaster_tasting_notes.split(',').map((n) => n.trim()).filter(Boolean)
        : null
      const elevation = fields.elevation_masl ? parseInt(fields.elevation_masl, 10) : null

      const { error: updateError } = await supabase
        .from('coffees')
        .update({
          roaster_name: fields.roaster_name.trim(),
          coffee_name: fields.coffee_name.trim(),
          origin_country: fields.origin_country.trim(),
          origin_region: fields.origin_region.trim() || null,
          producer: fields.producer.trim() || null,
          farm: fields.farm.trim() || null,
          process: fields.process,
          process_detail: fields.process_detail.trim() || null,
          roaster_stated_roast_level: fields.roaster_stated_roast_level,
          variety,
          elevation_masl: elevation,
          roaster_tasting_notes_raw: tastingNotesArr,
        })
        .eq('id', coffee.id)

      if (updateError) throw updateError
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.container}>
      <button onClick={onCancel} style={s.backLink}>← Cancel</button>
      <p style={s.eyebrow}>Edit details</p>
      <h2 style={s.heading}>{coffee.coffee_name}</h2>
      <p style={s.subheading}>
        Fix anything wrong with this coffee's catalog details. Changes apply for everyone.
      </p>

      <div style={s.form}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Roaster <span style={s.required}>*</span></label>
          <input style={s.input} type="text" value={fields.roaster_name} onChange={(e) => setFields({ ...fields, roaster_name: e.target.value })} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Coffee name <span style={s.required}>*</span></label>
          <input style={s.input} type="text" value={fields.coffee_name} onChange={(e) => setFields({ ...fields, coffee_name: e.target.value })} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Origin country <span style={s.required}>*</span></label>
          <input style={s.input} type="text" value={fields.origin_country} onChange={(e) => setFields({ ...fields, origin_country: e.target.value })} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Process <span style={s.required}>*</span></label>
          <select style={s.select} value={fields.process} onChange={(e) => setFields({ ...fields, process: e.target.value })}>
            <option value="">Select a process</option>
            {PROCESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Process detail</label>
          <input style={s.input} type="text" value={fields.process_detail} onChange={(e) => setFields({ ...fields, process_detail: e.target.value })} placeholder="e.g. 72hr anaerobic" />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Roast level <span style={s.required}>*</span></label>
          <select style={s.select} value={fields.roaster_stated_roast_level} onChange={(e) => setFields({ ...fields, roaster_stated_roast_level: e.target.value })}>
            <option value="">Select roast level</option>
            {ROAST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Origin region</label>
          <input style={s.input} type="text" value={fields.origin_region} onChange={(e) => setFields({ ...fields, origin_region: e.target.value })} placeholder="e.g. Yirgacheffe" />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Producer</label>
          <input style={s.input} type="text" value={fields.producer} onChange={(e) => setFields({ ...fields, producer: e.target.value })} placeholder="e.g. Hambela Estate" />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Farm</label>
          <input style={s.input} type="text" value={fields.farm} onChange={(e) => setFields({ ...fields, farm: e.target.value })} placeholder="e.g. Finca Las Delicias" />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Variety</label>
          <input style={s.input} type="text" value={fields.variety} onChange={(e) => setFields({ ...fields, variety: e.target.value })} placeholder="e.g. Heirloom, Bourbon" />
          <p style={s.helperText}>Comma-separated.</p>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Elevation (masl)</label>
          <input style={s.input} type="number" value={fields.elevation_masl} onChange={(e) => setFields({ ...fields, elevation_masl: e.target.value })} placeholder="e.g. 2000" />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Roaster's tasting notes</label>
          <input style={s.input} type="text" value={fields.roaster_tasting_notes} onChange={(e) => setFields({ ...fields, roaster_tasting_notes: e.target.value })} placeholder="e.g. blueberry, dark chocolate, cherry" />
          <p style={s.helperText}>Comma-separated. From the bag.</p>
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          style={{ ...s.primaryButton, ...(!canSave || saving ? s.disabledButton : {}) }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
