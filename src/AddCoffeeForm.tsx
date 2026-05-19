import { useState, type FormEvent, type ChangeEvent } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'

type FormState = {
  roaster_name: string
  coffee_name: string
  origin_country: string
  origin_region: string
  producer: string
  process: string
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
  process: '',
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

const ROAST_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'medium_light', label: 'Medium-light' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium_dark', label: 'Medium-dark' },
  { value: 'dark', label: 'Dark' },
]

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function isHeicFile(file: File): boolean {
  const ext = getExtension(file.name)
  return (
    ext === 'heic' ||
    ext === 'heif' ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  )
}

function isAllowedFile(file: File): boolean {
  const ext = getExtension(file.name)
  if (ALLOWED_EXTENSIONS.includes(ext)) return true
  if (ALLOWED_MIME.includes(file.type)) return true
  return false
}

const styles = {
  wrapper: {
    marginTop: '4rem',
    paddingTop: '2.5rem',
    borderTop: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  heading: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '2rem',
    fontStyle: 'italic' as const,
    margin: '0 0 0.5rem',
    letterSpacing: '-0.02em',
  },
  subheading: {
    fontSize: '0.9rem',
    opacity: 0.6,
    margin: '0 0 2rem',
  },
  form: {
    display: 'grid',
    gap: '1.25rem',
    maxWidth: '600px',
  } as const,
  fieldGroup: {
    display: 'grid',
    gap: '0.35rem',
  } as const,
  label: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    opacity: 0.7,
  },
  required: {
    color: '#D94E1F',
  },
  input: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid rgba(30, 20, 16, 0.25)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: '#1E1410',
    width: '100%',
  } as const,
  select: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid rgba(30, 20, 16, 0.25)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: '#1E1410',
    width: '100%',
    cursor: 'pointer' as const,
  },
  fileInput: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.9rem',
  },
  helperText: {
    fontSize: '0.8rem',
    opacity: 0.55,
    fontStyle: 'italic' as const,
  },
  convertingNotice: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#D94E1F',
    fontStyle: 'italic' as const,
    marginTop: '0.4rem',
  },
  submitButton: {
    padding: '0.85rem 1.75rem',
    backgroundColor: '#D94E1F',
    color: '#F4EAD5',
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
    justifySelf: 'start' as const,
    marginTop: '0.5rem',
  },
  submitDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed' as const,
  },
  message: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
  },
  successMessage: {
    background: 'rgba(47, 74, 56, 0.1)',
    color: '#2F4A38',
    border: '1px solid rgba(47, 74, 56, 0.25)',
  },
  errorMessage: {
    background: 'rgba(217, 78, 31, 0.1)',
    color: '#D94E1F',
    border: '1px solid rgba(217, 78, 31, 0.25)',
  },
  imagePreview: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '1px solid rgba(30, 20, 16, 0.15)',
    marginTop: '0.5rem',
    objectFit: 'cover' as const,
  },
}

export function AddCoffeeForm() {
  const { user } = useAuth()
  const [state, setState] = useState<FormState>(initialState)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [converting, setConverting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setState({ ...state, [field]: e.target.value })
    }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    // Validate type — extension OR MIME match
    if (!isAllowedFile(file)) {
      setMessage({
        type: 'error',
        text: 'JPEG, PNG, WebP, or HEIC only.',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // HEICs can be 5-8MB; bump the cap to 10MB so iPhone photos clear it
      setMessage({ type: 'error', text: 'Image must be smaller than 10MB.' })
      return
    }

    setMessage(null)

    // If HEIC, convert to JPEG client-side
    if (isHeicFile(file)) {
      setConverting(true)
      try {
        // Dynamic import — heic2any pulls in libheif (~1MB WASM) only when needed
        const heic2any = (await import('heic2any')).default
        const result = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        })
        // heic2any returns Blob | Blob[] — single-image HEICs are Blob, but multi-image are arrays
        const convertedBlob = Array.isArray(result) ? result[0] : result
        const convertedFile = new File(
          [convertedBlob],
          file.name.replace(/\.(heic|heif)$/i, '.jpg'),
          { type: 'image/jpeg' }
        )
        setImageFile(convertedFile)
        setImagePreview(URL.createObjectURL(convertedFile))
        setConverting(false)
      } catch (err) {
        console.error('HEIC conversion failed:', err)
        setConverting(false)
        setMessage({
          type: 'error',
          text: "Couldn't convert that HEIC. Try a JPEG or PNG.",
        })
      }
      return
    }

    // Non-HEIC, non-converted — use directly
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

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

    if (!imageFile) {
      setMessage({ type: 'error', text: 'Add a bag photo.' })
      return
    }

    if (converting) {
      setMessage({ type: 'error', text: 'Still converting the image — hold on.' })
      return
    }

    setSubmitting(true)

    try {
      const fileExt = getExtension(imageFile.name) || 'jpg'
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('bag-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('bag-images').getPublicUrl(filePath)
      const bagImageUrl = urlData.publicUrl

      const variety = state.variety
        ? state.variety
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : null

      const tastingNotes = state.roaster_tasting_notes
        ? state.roaster_tasting_notes
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean)
        : null

      const elevation = state.elevation_masl ? parseInt(state.elevation_masl, 10) : null

      const { error: insertError } = await supabase.from('coffees').insert({
        roaster_name: state.roaster_name.trim(),
        coffee_name: state.coffee_name.trim(),
        origin_country: state.origin_country.trim(),
        origin_region: state.origin_region.trim() || null,
        producer: state.producer.trim() || null,
        process: state.process,
        roaster_stated_roast_level: state.roaster_stated_roast_level,
        variety,
        elevation_masl: elevation,
        roaster_tasting_notes_raw: tastingNotes,
        bag_image_url: bagImageUrl,
        created_by: user.id,
      })

      if (insertError) throw insertError

      setState(initialState)
      setImageFile(null)
      setImagePreview(null)
      setMessage({
        type: 'success',
        text: `Added "${state.coffee_name}" from ${state.roaster_name}.`,
      })
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
      <p style={styles.subheading}>Admin only — populates the catalog.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Roaster <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="text"
            value={state.roaster_name}
            onChange={handleChange('roaster_name')}
            placeholder="e.g. Sey Coffee"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Coffee name <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="text"
            value={state.coffee_name}
            onChange={handleChange('coffee_name')}
            placeholder="e.g. Hambela Hamasho"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Origin country <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="text"
            value={state.origin_country}
            onChange={handleChange('origin_country')}
            placeholder="e.g. Ethiopia"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Process <span style={styles.required}>*</span>
          </label>
          <select
            style={styles.select}
            value={state.process}
            onChange={handleChange('process')}
          >
            <option value="">Select a process</option>
            {PROCESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Roast level (per the bag) <span style={styles.required}>*</span>
          </label>
          <select
            style={styles.select}
            value={state.roaster_stated_roast_level}
            onChange={handleChange('roaster_stated_roast_level')}
          >
            <option value="">Select a roast level</option>
            {ROAST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Bag photo <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={handleImageChange}
          />
          <p style={styles.helperText}>JPEG, PNG, WebP, or HEIC. HEIC auto-converts.</p>
          {converting && (
            <p style={styles.convertingNotice}>Converting HEIC to JPEG…</p>
          )}
          {imagePreview && (
            <img src={imagePreview} alt="Bag preview" style={styles.imagePreview} />
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Origin region</label>
          <input
            style={styles.input}
            type="text"
            value={state.origin_region}
            onChange={handleChange('origin_region')}
            placeholder="e.g. Yirgacheffe"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Producer</label>
          <input
            style={styles.input}
            type="text"
            value={state.producer}
            onChange={handleChange('producer')}
            placeholder="e.g. Hambela Estate"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Variety</label>
          <input
            style={styles.input}
            type="text"
            value={state.variety}
            onChange={handleChange('variety')}
            placeholder="e.g. Heirloom, or Bourbon, Typica"
          />
          <p style={styles.helperText}>Comma-separated for blends.</p>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Elevation (masl)</label>
          <input
            style={styles.input}
            type="number"
            value={state.elevation_masl}
            onChange={handleChange('elevation_masl')}
            placeholder="e.g. 2000"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Roaster's tasting notes</label>
          <input
            style={styles.input}
            type="text"
            value={state.roaster_tasting_notes}
            onChange={handleChange('roaster_tasting_notes')}
            placeholder="e.g. blueberry, dark chocolate, cherry"
          />
          <p style={styles.helperText}>Comma-separated. From the bag.</p>
        </div>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.type === 'success' ? styles.successMessage : styles.errorMessage),
            }}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(submitting || converting ? styles.submitDisabled : {}),
          }}
          disabled={submitting || converting}
        >
          {submitting ? 'Adding…' : 'Add coffee'}
        </button>
      </form>
    </div>
  )
}