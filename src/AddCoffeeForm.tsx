import { useState, type FormEvent, type ChangeEvent } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'
import { prepareImage, uploadBagImage, getExtension } from './lib/bagImage'

type FormState = {
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

const initialState: FormState = {
  roaster_name: '',
  coffee_name: '',
  origin_country: '',
  origin_region: '',
  producer: '',
  farm: '',
  process: '',
  process_detail: '',
  roaster_stated_roast_level: '',
  variety: '',
  elevation_masl: '',
  roaster_tasting_notes: '',
}

const PROCESS_OPTIONS = [
  { value: 'washed', label: 'Washed' },
  { value: 'natural', label: 'Natural' },
  { value: 'honey', label: 'Honey' },
  { value: 'anaerobic', label: 'Anaerobic' },
  { value: 'carbonic_maceration', label: 'Carbonic maceration' },
  { value: 'pulped_natural', label: 'Pulped natural' },
  { value: 'wet_hulled', label: 'Wet-hulled' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'other', label: 'Other' },
]
const PROCESS_VALUES = PROCESS_OPTIONS.map((o) => o.value)

const ROAST_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'medium_light', label: 'Medium-light' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium_dark', label: 'Medium-dark' },
  { value: 'dark', label: 'Dark' },
]

// Claude returns hyphenated roast levels; the form select uses underscores.
const ROAST_FROM_SCAN: Record<string, string> = {
  light: 'light',
  'medium-light': 'medium_light',
  medium: 'medium',
  'medium-dark': 'medium_dark',
  dark: 'dark',
}

const styles = {
  wrapper: { marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(30, 20, 16, 0.15)' } as const,
  heading: { fontFamily: '"Instrument Serif", serif', fontSize: '2rem', fontStyle: 'italic' as const, margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  subheading: { fontSize: '0.9rem', opacity: 0.6, margin: '0 0 2rem' },
  form: { display: 'grid', gap: '1.25rem', maxWidth: '600px' } as const,
  fieldGroup: { display: 'grid', gap: '0.35rem' } as const,
  label: { fontFamily: 'Geist, system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.12em', opacity: 0.7 },
  required: { color: '#D94E1F' },
  input: { fontFamily: 'Geist, system-ui, sans-serif', fontSize: '1rem', padding: '0.65rem 0.85rem', border: '1px solid rgba(30, 20, 16, 0.25)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.4)', color: '#1E1410', width: '100%' } as const,
  select: { fontFamily: 'Geist, system-ui, sans-serif', fontSize: '1rem', padding: '0.65rem 0.85rem', border: '1px solid rgba(30, 20, 16, 0.25)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.4)', color: '#1E1410', width: '100%', cursor: 'pointer' as const },
  fileInput: { fontFamily: 'Geist, system-ui, sans-serif', fontSize: '0.9rem' },
  helperText: { fontSize: '0.8rem', opacity: 0.55, fontStyle: 'italic' as const },
  submitButton: { padding: '0.85rem 1.75rem', backgroundColor: '#D94E1F', color: '#F4EAD5', border: 'none', borderRadius: '100px', fontSize: '1rem', fontFamily: 'Geist, system-ui, sans-serif', fontWeight: 500, cursor: 'pointer' as const, justifySelf: 'start' as const, marginTop: '0.5rem' },
  submitDisabled: { opacity: 0.5, cursor: 'not-allowed' as const },
  message: { padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.95rem' },
  successMessage: { background: 'rgba(47, 74, 56, 0.1)', color: '#2F4A38', border: '1px solid rgba(47, 74, 56, 0.25)' },
  errorMessage: { background: 'rgba(217, 78, 31, 0.1)', color: '#D94E1F', border: '1px solid rgba(217, 78, 31, 0.25)' },
  imagePreview: { maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid rgba(30, 20, 16, 0.15)', marginTop: '0.5rem', objectFit: 'cover' as const },
  scanWrap: { padding: '1.25rem', border: '1px dashed rgba(30, 20, 16, 0.3)', borderRadius: '12px', marginBottom: '2rem' } as const,
  scanBanner: { background: 'rgba(217, 78, 31, 0.1)', color: '#D94E1F', border: '1px solid rgba(217, 78, 31, 0.25)', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' },
}

type AddCoffeeFormProps = {
  onRate?: (coffeeId: string) => void
}

export function AddCoffeeForm({ onRate }: AddCoffeeFormProps) {
  const { user } = useAuth()
  const [state, setState] = useState<FormState>(initialState)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [bagImageUrl, setBagImageUrl] = useState<string | null>(null) // set when a scan uploads the photo
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Scan state
  const [scanning, setScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [prefilledSnapshot, setPrefilledSnapshot] = useState<FormState | null>(null)
  const [lastSaved, setLastSaved] = useState<{ id: string; name: string } | null>(null)

  const handleChange =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setState({ ...state, [field]: e.target.value })
    }

  // --- Scan: upload the bag, extract, log the scan, pre-fill the form ---
  const handleScan = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setMessage(null)
    setScanError(null)
    setLastSaved(null)
    setScanning(true)
    try {
      setScanStatus('Preparing image…')
      const ready = await prepareImage(file)
      setImagePreview(URL.createObjectURL(ready))
      setImageFile(null) // the scan path provides the URL directly

      setScanStatus('Uploading…')
      const imageUrl = await uploadBagImage(ready, user.id)
      setBagImageUrl(imageUrl)

      setScanStatus('Reading the bag…')
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed.')

      // Log the immutable raw extraction; keep the row id to update on save.
      const { data: scanRow, error: scanInsertError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          photo_url: imageUrl,
          raw_extraction: data.extracted ?? data,
          model_version: data.model ?? null,
          prompt_version: data.promptVersion ?? null,
        })
        .select('id')
        .single()
      if (scanInsertError) throw scanInsertError
      setScanId(scanRow.id)

      // Pre-fill the form from the extraction (with the format conversions).
      const ex = data.extracted ?? {}
      const prefilled: FormState = {
        roaster_name: ex.roaster_name ?? '',
        coffee_name: ex.coffee_name ?? '',
        origin_country: ex.origin_country ?? '',
        origin_region: ex.origin_region ?? '',
        producer: ex.producer ?? '',
        farm: ex.farm ?? '',
        process: PROCESS_VALUES.includes(ex.processing_method) ? ex.processing_method : '',
        process_detail: ex.process_detail ?? '',
        roaster_stated_roast_level: ROAST_FROM_SCAN[ex.roast_level] ?? '',
        variety: ex.variety ?? '',
        elevation_masl: ex.elevation ? (String(ex.elevation).match(/\d+/)?.[0] ?? '') : '',
        roaster_tasting_notes: Array.isArray(ex.tasting_notes) ? ex.tasting_notes.join(', ') : '',
      }
      setState(prefilled)
      setPrefilledSnapshot(prefilled)
      setScanStatus(null)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Scan failed.')
      setScanStatus(null)
    } finally {
      setScanning(false)
    }
  }

  // --- Manual photo (fallback path, no scan) ---
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    setMessage(null)
    try {
      const ready = await prepareImage(file)
      setImageFile(ready)
      setImagePreview(URL.createObjectURL(ready))
      setBagImageUrl(null) // a manually chosen photo replaces the scan image
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Image error.' })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLastSaved(null)

    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in.' })
      return
    }
    if (
      !state.roaster_name ||
      !state.coffee_name ||
      !state.origin_country ||
      !state.process ||
      !state.roaster_stated_roast_level
    ) {
      setMessage({ type: 'error', text: 'Fill in all required fields.' })
      return
    }
    if (!bagImageUrl && !imageFile) {
      setMessage({ type: 'error', text: 'Add a bag photo (scan or choose one).' })
      return
    }

    setSubmitting(true)
    try {
      // Use the scan-uploaded image if present, else upload the manual one.
      let imageUrl = bagImageUrl
      if (!imageUrl && imageFile) {
        const fileExt = getExtension(imageFile.name) || 'jpg'
        const filePath = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('bag-images').upload(filePath, imageFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('bag-images').getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      const variety = state.variety
        ? state.variety.split(',').map((v) => v.trim()).filter(Boolean)
        : null
      const tastingNotes = state.roaster_tasting_notes
        ? state.roaster_tasting_notes.split(',').map((n) => n.trim()).filter(Boolean)
        : null
      const elevation = state.elevation_masl ? parseInt(state.elevation_masl, 10) : null

      const { data: coffeeRow, error: insertError } = await supabase
        .from('coffees')
        .insert({
          roaster_name: state.roaster_name.trim(),
          coffee_name: state.coffee_name.trim(),
          origin_country: state.origin_country.trim(),
          origin_region: state.origin_region.trim() || null,
          producer: state.producer.trim() || null,
          farm: state.farm.trim() || null,
          process: state.process,
          process_detail: state.process_detail.trim() || null,
          roaster_stated_roast_level: state.roaster_stated_roast_level,
          variety,
          elevation_masl: elevation,
          roaster_tasting_notes_raw: tastingNotes,
          bag_image_url: imageUrl,
          created_by: user.id,
        })
        .select('id')
        .single()
      if (insertError) throw insertError

      // If this coffee came from a scan, capture the correction diff (the eval signal).
      if (scanId && prefilledSnapshot) {
        const corrections: Record<string, { from: string; to: string }> = {}
        let changed = 0
        const fields = Object.keys(prefilledSnapshot) as (keyof FormState)[]
        for (const f of fields) {
          const before = (prefilledSnapshot[f] ?? '').trim()
          const after = (state[f] ?? '').trim()
          if (before !== after) {
            corrections[f] = { from: before, to: after }
            changed++
          }
        }
        const accuracy = fields.length
          ? Number(((fields.length - changed) / fields.length).toFixed(2))
          : null
        await supabase
          .from('scans')
          .update({ corrections, matched_coffee_id: coffeeRow.id, scan_accuracy_score: accuracy })
          .eq('id', scanId)
      }

      // Reset. (lastSaved is set below so the optional "Rate it now" path stays available.)
      setState(initialState)
      setImageFile(null)
      setImagePreview(null)
      setBagImageUrl(null)
      setScanId(null)
      setPrefilledSnapshot(null)
      setLastSaved({ id: coffeeRow.id, name: state.coffee_name })
      setMessage({ type: 'success', text: `Added "${state.coffee_name}" from ${state.roaster_name}.` })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setMessage({ type: 'error', text: `Failed: ${errorMessage}` })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Add a coffee</h2>
      <p style={styles.subheading}>Scan a bag to pre-fill, or enter manually.</p>

      {/* Scan section */}
      <div style={styles.scanWrap}>
        <label style={styles.label}>Scan a bag to pre-fill</label>
        <div style={{ marginTop: '0.6rem' }}>
          <input
            style={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={handleScan}
            disabled={scanning || submitting}
          />
        </div>
        {scanStatus && <p style={{ ...styles.helperText, color: '#D94E1F' }}>{scanStatus}</p>}
        {scanError && <p style={{ ...styles.helperText, color: '#D94E1F' }}>Scan failed: {scanError}</p>}
      </div>

      {prefilledSnapshot && (
        <div style={styles.scanBanner}>Pre-filled from the bag — check every field and correct anything wrong before saving.</div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Roaster <span style={styles.required}>*</span></label>
          <input style={styles.input} type="text" value={state.roaster_name} onChange={handleChange('roaster_name')} placeholder="e.g. Sey Coffee" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Coffee name <span style={styles.required}>*</span></label>
          <input style={styles.input} type="text" value={state.coffee_name} onChange={handleChange('coffee_name')} placeholder="e.g. Hambela Hamasho" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Origin country <span style={styles.required}>*</span></label>
          <input style={styles.input} type="text" value={state.origin_country} onChange={handleChange('origin_country')} placeholder="e.g. Ethiopia" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Process <span style={styles.required}>*</span></label>
          <select style={styles.select} value={state.process} onChange={handleChange('process')}>
            <option value="">Select a process</option>
            {PROCESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Process detail</label>
          <input style={styles.input} type="text" value={state.process_detail} onChange={handleChange('process_detail')} placeholder="e.g. 72hr anaerobic, yeast-inoculated" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Roast level (per the bag) <span style={styles.required}>*</span></label>
          <select style={styles.select} value={state.roaster_stated_roast_level} onChange={handleChange('roaster_stated_roast_level')}>
            <option value="">Select a roast level</option>
            {ROAST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Bag photo {!bagImageUrl && <span style={styles.required}>*</span>}</label>
          <input style={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={handleImageChange} />
          <p style={styles.helperText}>{bagImageUrl ? 'Using the scanned photo. Choose a file to replace it.' : 'JPEG, PNG, WebP, or HEIC. HEIC auto-converts.'}</p>
          {imagePreview && <img src={imagePreview} alt="Bag preview" style={styles.imagePreview} />}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Origin region</label>
          <input style={styles.input} type="text" value={state.origin_region} onChange={handleChange('origin_region')} placeholder="e.g. Yirgacheffe" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Producer</label>
          <input style={styles.input} type="text" value={state.producer} onChange={handleChange('producer')} placeholder="e.g. Hambela Estate" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Farm</label>
          <input style={styles.input} type="text" value={state.farm} onChange={handleChange('farm')} placeholder="e.g. Finca Las Delicias" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Variety</label>
          <input style={styles.input} type="text" value={state.variety} onChange={handleChange('variety')} placeholder="e.g. Heirloom, or Bourbon, Typica" />
          <p style={styles.helperText}>Comma-separated for blends.</p>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Elevation (masl)</label>
          <input style={styles.input} type="number" value={state.elevation_masl} onChange={handleChange('elevation_masl')} placeholder="e.g. 2000" />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Roaster's tasting notes</label>
          <input style={styles.input} type="text" value={state.roaster_tasting_notes} onChange={handleChange('roaster_tasting_notes')} placeholder="e.g. blueberry, dark chocolate, cherry" />
          <p style={styles.helperText}>Comma-separated. From the bag.</p>
        </div>

        {message && (
          <div style={{ ...styles.message, ...(message.type === 'success' ? styles.successMessage : styles.errorMessage) }}>
            {message.text}
          </div>
        )}

        {lastSaved && onRate && (
          <button
            type="button"
            onClick={() => onRate(lastSaved.id)}
            style={{
              padding: '0.85rem 1.75rem',
              backgroundColor: 'transparent',
              color: '#D94E1F',
              border: '1px solid #D94E1F',
              borderRadius: '100px',
              fontSize: '1rem',
              fontFamily: 'Geist, system-ui, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              justifySelf: 'start',
            }}
          >
            Rate "{lastSaved.name}" now →
          </button>
        )}

        <button type="submit" style={{ ...styles.submitButton, ...(submitting || scanning ? styles.submitDisabled : {}) }} disabled={submitting || scanning}>
          {submitting ? 'Adding…' : 'Add coffee'}
        </button>
      </form>
    </div>
  )
}