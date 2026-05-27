import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'
import { prepareImage, uploadBagImage } from './lib/bagImage'
import { RatingForm, type RatingFormSubmitPayload } from './components/RatingForm'

// ---------------------------------------------------------------------------
// Constants ported from AddCoffeeForm
// ---------------------------------------------------------------------------

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

const ROAST_FROM_SCAN: Record<string, string> = {
  light: 'light',
  'medium-light': 'medium_light',
  medium: 'medium',
  'medium-dark': 'medium_dark',
  dark: 'dark',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

const initialCoffeeFields: CoffeeFields = {
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

// Dedupe match types — populated from /api/scan response or a manual-save
// pre-check via the match_coffees RPC. See Decision #041.
type MatchCandidate = {
  id: string
  roaster_name: string
  coffee_name: string
  origin_country: string | null
  bag_image_url: string | null
  similarity: number
}
type MatchResult = {
  kind: 'strong' | 'ambiguous'
  candidates: MatchCandidate[]
}

type FlowStep = 'capture' | 'details' | 'rate' | 'complete'

type Props = {
  onComplete: () => void
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

const s = {
  container: { marginTop: '2rem', maxWidth: '600px' } as const,
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
  stepEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: espresso,
    opacity: 0.4,
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
  sectionLabel: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: espresso,
    opacity: 0.55,
    margin: '0 0 1rem',
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
  secondaryButton: {
    padding: '0.65rem 1.25rem',
    backgroundColor: 'transparent',
    color: espresso,
    border: `1px solid rgba(30, 20, 16, 0.25)`,
    borderRadius: '100px',
    fontSize: '0.9rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
  } as const,
  disabledButton: { opacity: 0.5, cursor: 'not-allowed' as const },
  scanBanner: {
    background: 'rgba(217, 78, 31, 0.1)',
    color: ember,
    border: `1px solid rgba(217, 78, 31, 0.25)`,
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    fontFamily: 'Geist, system-ui, sans-serif',
  } as const,
  imagePreview: {
    maxWidth: '160px',
    maxHeight: '160px',
    borderRadius: '8px',
    border: '1px solid rgba(30, 20, 16, 0.15)',
    objectFit: 'cover' as const,
    marginTop: '0.5rem',
  } as const,
  section: { marginBottom: '2.5rem' } as const,
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
  } as const,
  chip: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '100px',
    border: '1px solid',
    cursor: 'pointer' as const,
    transition: 'all 0.12s',
    fontWeight: 500,
  } as const,
  error: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: ember,
    margin: 0,
  } as const,
  helperText: {
    fontSize: '0.8rem',
    opacity: 0.55,
    fontStyle: 'italic' as const,
    fontFamily: 'Geist, system-ui, sans-serif',
    color: espresso,
  } as const,
  brewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
  } as const,
  coffeeContext: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(30, 20, 16, 0.15)',
    marginBottom: '2.5rem',
  } as const,
  coffeeContextImage: {
    width: '72px',
    height: '72px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    border: '1px solid rgba(30, 20, 16, 0.15)',
    background: 'rgba(30, 20, 16, 0.05)',
    flexShrink: 0,
  } as const,
  // Match-suggestion card (Decision #041) — shown above the form when the
  // scan or manual save detects the coffee may already be in the catalog.
  matchCard: {
    border: `2px solid ${ember}`,
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    background: 'rgba(217, 78, 31, 0.05)',
  } as const,
  matchEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: ember,
    margin: '0 0 0.35rem',
  } as const,
  matchTitle: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.4rem',
    fontStyle: 'italic' as const,
    color: espresso,
    margin: '0 0 1rem',
    lineHeight: 1.2,
  } as const,
  matchCandidatesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginBottom: '1rem',
  } as const,
  matchCandidate: {
    display: 'flex',
    gap: '0.85rem',
    alignItems: 'center',
    padding: '0.75rem',
    background: cream,
    borderRadius: '8px',
    border: '1px solid rgba(30, 20, 16, 0.1)',
  } as const,
  matchImages: {
    display: 'flex',
    gap: '0.35rem',
    flexShrink: 0,
  } as const,
  matchThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    objectFit: 'cover' as const,
    border: '1px solid rgba(30, 20, 16, 0.1)',
    background: 'rgba(30, 20, 16, 0.05)',
  } as const,
  matchCandidateMeta: {
    flex: 1,
    minWidth: 0,
  } as const,
  matchCandidateRoaster: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: espresso,
    opacity: 0.55,
    margin: '0 0 0.15rem',
  } as const,
  matchCandidateName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.05rem',
    fontStyle: 'italic' as const,
    color: espresso,
    margin: 0,
    lineHeight: 1.2,
  } as const,
  matchCandidateOrigin: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.8rem',
    color: espresso,
    opacity: 0.6,
    margin: '0.15rem 0 0',
  } as const,
  matchAcceptButton: {
    padding: '0.5rem 1rem',
    backgroundColor: ember,
    color: cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  } as const,
  matchDismissButton: {
    background: 'none',
    border: 'none',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: espresso,
    opacity: 0.65,
    cursor: 'pointer' as const,
    padding: '0.25rem 0',
    textDecoration: 'underline' as const,
  } as const,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddAndRateFlow({ onComplete, onCancel }: Props) {
  const { user } = useAuth()

  // Step state
  const [step, setStep] = useState<FlowStep>('capture')

  // Image / scan state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [bagImageUrl, setBagImageUrl] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [prefilledSnapshot, setPrefilledSnapshot] = useState<CoffeeFields | null>(null)

  // Coffee form state
  const [coffee, setCoffee] = useState<CoffeeFields>(initialCoffeeFields)
  const [savedCoffee, setSavedCoffee] = useState<{ id: string; name: string; roaster: string; imageUrl: string | null } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Dedupe match state (Decision #041). matchResult is the active suggestion
  // surfaced to the user; seenMatchIds tracks candidates the user has already
  // dismissed so subsequent re-checks don't re-offer them.
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [seenMatchIds, setSeenMatchIds] = useState<Set<string>>(new Set())

  // Rating-step "complete" interstitial state
  const [coffeeCount, setCoffeeCount] = useState<number | null>(null)

  // Ref to avoid stale closure in scan callback
  const coffeeRef = useRef(coffee)
  coffeeRef.current = coffee

  // Auto-navigate after completion
  useEffect(() => {
    if (step !== 'complete') return
    const timer = setTimeout(() => onComplete(), 2000)
    return () => clearTimeout(timer)
  }, [step, onComplete])

  // -------------------------------------------------------------------------
  // Capture handlers
  // -------------------------------------------------------------------------

  const handleCapture = async (file: File) => {
    if (!user) return
    setScanError(null)

    try {
      setScanStatus('Preparing image…')
      const ready = await prepareImage(file)
      setImagePreview(URL.createObjectURL(ready))

      // Advance to details immediately — scan runs in background
      setStep('details')
      setScanning(true)

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
      let data: Record<string, unknown>
      try {
        data = await res.json()
      } catch {
        throw new Error('Scan timed out or returned an empty response. Try a smaller image or enter details manually.')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = data as any
      if (!res.ok) throw new Error(d.error || 'Scan failed.')

      const { data: scanRow, error: scanInsertError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          photo_url: imageUrl,
          raw_extraction: d.extracted ?? data,
          model_version: d.model ?? null,
          prompt_version: d.promptVersion ?? null,
        })
        .select('id')
        .single()
      if (scanInsertError) throw scanInsertError
      setScanId(scanRow.id)

      // Merge scan results into empty fields only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ex = (data as any).extracted ?? {}
      const prefilled: CoffeeFields = {
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
      setPrefilledSnapshot(prefilled)

      // Merge into current form: only fill fields the user hasn't touched
      setCoffee((current) => {
        const merged = { ...current }
        for (const key of Object.keys(prefilled) as (keyof CoffeeFields)[]) {
          if (!merged[key] && prefilled[key]) {
            merged[key] = prefilled[key]
          }
        }
        return merged
      })

      // Surface any dedupe candidates the server found (Decision #041). The
      // server has already classified strong vs. ambiguous and filtered by
      // the production similarity floor — we just render what's returned.
      const matchPayload = d.match as { kind?: string; candidates?: MatchCandidate[] } | undefined
      const matchKind = matchPayload?.kind
      const matchCandidates = matchPayload?.candidates
      if ((matchKind === 'strong' || matchKind === 'ambiguous') && Array.isArray(matchCandidates) && matchCandidates.length > 0) {
        setMatchResult({ kind: matchKind, candidates: matchCandidates })
      }

      setScanStatus(null)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Scan failed.')
      setScanStatus(null)
    } finally {
      setScanning(false)
    }
  }

  const handleSkipCapture = () => {
    setStep('details')
  }

  // -------------------------------------------------------------------------
  // Match handlers (Decision #041)
  // -------------------------------------------------------------------------

  // User accepted a candidate as "the same coffee" — hand off into the rate
  // step against the existing coffee row instead of inserting a new one.
  // Records the match on the scan row (if any) so the dedupe pipeline has a
  // measurable acceptance signal for the eval (Competency A).
  const acceptMatch = async (candidate: MatchCandidate) => {
    if (scanId) {
      await supabase
        .from('scans')
        .update({ matched_coffee_id: candidate.id })
        .eq('id', scanId)
    }
    setSavedCoffee({
      id: candidate.id,
      name: candidate.coffee_name,
      roaster: candidate.roaster_name,
      imageUrl: candidate.bag_image_url,
    })
    setMatchResult(null)
    setStep('rate')
  }

  // User said "not this one" — remember the dismissed candidate IDs so a
  // subsequent save-time check doesn't re-surface the same suggestion.
  const dismissMatch = () => {
    if (!matchResult) return
    setSeenMatchIds((prev) => {
      const next = new Set(prev)
      matchResult.candidates.forEach((c) => next.add(c.id))
      return next
    })
    setMatchResult(null)
  }

  // -------------------------------------------------------------------------
  // Details: save coffee
  // -------------------------------------------------------------------------

  const handleSaveCoffee = async () => {
    if (!user) return
    setSaveError(null)

    if (!coffee.roaster_name || !coffee.coffee_name || !coffee.origin_country || !coffee.process || !coffee.roaster_stated_roast_level) {
      setSaveError('Fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      // Manual-save dedupe check (Decision #041). If the scan already surfaced
      // a match the user dismissed, those IDs sit in seenMatchIds and get
      // filtered out so we don't re-offer them. Otherwise — typically the
      // skip-scan / manual-entry path — this is the only line of defense.
      if (!matchResult) {
        const matchQuery = `${coffee.roaster_name} ${coffee.coffee_name}`.trim()
        const { data: rpcCandidates } = await supabase.rpc('match_coffees', {
          query: matchQuery,
          match_limit: 3,
          min_similarity: 0.5,
        })
        if (Array.isArray(rpcCandidates) && rpcCandidates.length > 0) {
          const fresh = (rpcCandidates as MatchCandidate[]).filter((c) => !seenMatchIds.has(c.id))
          if (fresh.length > 0) {
            const top = Number(fresh[0].similarity)
            setMatchResult({ kind: top >= 0.8 ? 'strong' : 'ambiguous', candidates: fresh })
            setSaving(false)
            return
          }
        }
      }

      let imageUrl = bagImageUrl
      // If no image from scan and no captured image, allow proceeding without
      const variety = coffee.variety
        ? coffee.variety.split(',').map((v) => v.trim()).filter(Boolean)
        : null
      const tastingNotesArr = coffee.roaster_tasting_notes
        ? coffee.roaster_tasting_notes.split(',').map((n) => n.trim()).filter(Boolean)
        : null
      const elevation = coffee.elevation_masl ? parseInt(coffee.elevation_masl, 10) : null

      const { data: coffeeRow, error: insertError } = await supabase
        .from('coffees')
        .insert({
          roaster_name: coffee.roaster_name.trim(),
          coffee_name: coffee.coffee_name.trim(),
          origin_country: coffee.origin_country.trim(),
          origin_region: coffee.origin_region.trim() || null,
          producer: coffee.producer.trim() || null,
          farm: coffee.farm.trim() || null,
          process: coffee.process,
          process_detail: coffee.process_detail.trim() || null,
          roaster_stated_roast_level: coffee.roaster_stated_roast_level,
          variety,
          elevation_masl: elevation,
          roaster_tasting_notes_raw: tastingNotesArr,
          bag_image_url: imageUrl,
          created_by: user.id,
        })
        .select('id')
        .single()
      if (insertError) throw insertError

      // Scan correction tracking
      if (scanId && prefilledSnapshot) {
        const corrections: Record<string, { from: string; to: string }> = {}
        let changed = 0
        const fields = Object.keys(prefilledSnapshot) as (keyof CoffeeFields)[]
        for (const f of fields) {
          const before = (prefilledSnapshot[f] ?? '').trim()
          const after = (coffee[f] ?? '').trim()
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

      setSavedCoffee({
        id: coffeeRow.id,
        name: coffee.coffee_name,
        roaster: coffee.roaster_name,
        imageUrl: imageUrl,
      })
      setStep('rate')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save coffee.')
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Rate: submit rating
  // -------------------------------------------------------------------------

  const handleSubmitRating = async (payload: RatingFormSubmitPayload) => {
    if (!user || !savedCoffee) throw new Error('Missing coffee context.')

    const ratingRow: Record<string, unknown> = {
      user_id: user.id,
      coffee_id: savedCoffee.id,
      rating: payload.rating,
      user_tasting_notes: payload.tastingNotes,
      extraction_quality: payload.extraction,
      brew_method: payload.brewMethod,
      dose_grams: payload.doseGrams,
      yield_grams: payload.yieldGrams,
      brew_time_seconds: payload.brewTimeSeconds,
      grind_size: payload.grindSize,
      water_temp_celsius: payload.waterTempCelsius,
    }
    if (payload.body !== null) ratingRow.body = payload.body
    if (payload.acidity !== null) ratingRow.acidity = payload.acidity

    const { data: ratingData, error: ratingError } = await supabase
      .from('ratings')
      .insert(ratingRow)
      .select('id')
      .single()

    if (ratingError || !ratingData) {
      throw new Error(ratingError?.message ?? 'Something went wrong.')
    }

    if (payload.descriptorIds.length > 0) {
      const rows = payload.descriptorIds.map((descriptorId) => ({
        rating_id: ratingData.id,
        descriptor_id: descriptorId,
      }))
      await supabase.from('rating_flavor_descriptors').insert(rows)
    }

    const { count } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setCoffeeCount(count)
    setStep('complete')
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (step === 'complete') {
    return (
      <div style={{ marginTop: '8rem', textAlign: 'center', padding: '2rem' }}>
        <h2
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(4rem, 9vw, 7rem)',
            color: ember,
            margin: '0 0 1.5rem',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          Logged.
        </h2>
        <p
          style={{
            fontFamily: 'Geist, system-ui, sans-serif',
            fontSize: '1.1rem',
            color: espresso,
            opacity: 0.7,
            margin: 0,
          }}
        >
          {coffeeCount !== null
            ? `That's coffee #${coffeeCount} for you.`
            : 'Your palate is getting sharper.'}
        </p>
      </div>
    )
  }

  if (step === 'capture') {
    return (
      <div style={s.container}>
        <button onClick={onCancel} style={s.backLink}>← Cancel</button>
        <p style={s.stepEyebrow}>Step 1 of 3</p>
        <h2 style={s.heading}>Scan the bag</h2>
        <p style={s.subheading}>
          Find the side of your coffee bag with the roaster, origin, and tasting notes — then snap a photo. We'll read it and fill in the details.
        </p>

        <div
          style={{
            border: '2px dashed rgba(30, 20, 16, 0.2)',
            borderRadius: '16px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.3 }}>📷</div>
          <label
            style={{
              ...s.primaryButton,
              display: 'inline-block',
              position: 'relative',
              overflow: 'hidden',
              padding: '1rem 2rem',
              fontSize: '1.05rem',
            }}
          >
            Snap the bag
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleCapture(file)
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </label>
          <div style={{ marginTop: '1rem' }}>
            <label
              style={{
                ...s.secondaryButton,
                display: 'inline-block',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              Choose from library
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCapture(file)
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </label>
          </div>
          <p style={{
            fontFamily: 'Geist, system-ui, sans-serif',
            fontSize: '0.8rem',
            color: espresso,
            opacity: 0.4,
            marginTop: '1.25rem',
            lineHeight: 1.4,
          }}>
            Look for the label, card, or sticker with the coffee info — that's the best part to capture.
          </p>
        </div>

        <button onClick={handleSkipCapture} style={{ ...s.backLink, opacity: 0.4, textAlign: 'center', width: '100%' }}>
          Skip — enter manually
        </button>
      </div>
    )
  }

  if (step === 'details') {
    const canSave = coffee.roaster_name && coffee.coffee_name && coffee.origin_country && coffee.process && coffee.roaster_stated_roast_level
    return (
      <div style={s.container}>
        <button onClick={() => setStep('capture')} style={s.backLink}>← Back</button>
        <p style={s.stepEyebrow}>Step 2 of 3</p>
        <h2 style={s.heading}>Coffee details</h2>
        <p style={s.subheading}>Check the details and correct anything wrong.</p>

        {scanning && scanStatus && (
          <div style={s.scanBanner}>{scanStatus}</div>
        )}
        {scanError && (
          <div style={{ ...s.scanBanner, background: 'rgba(217, 78, 31, 0.08)' }}>
            Scan issue: {scanError}. You can still enter details manually.
          </div>
        )}
        {prefilledSnapshot && !scanning && !matchResult && (
          <div style={s.scanBanner}>
            Pre-filled from the bag — check every field before saving.
          </div>
        )}

        {matchResult && (
          <div style={s.matchCard}>
            <p style={s.matchEyebrow}>
              {matchResult.kind === 'strong' ? 'Already in Palato' : 'Possible match'}
            </p>
            <h3 style={s.matchTitle}>
              {matchResult.kind === 'strong'
                ? 'Looks like this coffee is already in your catalog.'
                : 'Did you mean one of these?'}
            </h3>
            <div style={s.matchCandidatesList}>
              {matchResult.candidates.map((c) => (
                <div key={c.id} style={s.matchCandidate}>
                  <div style={s.matchImages}>
                    {imagePreview && <img src={imagePreview} alt="You scanned" style={s.matchThumb} />}
                    {c.bag_image_url && <img src={c.bag_image_url} alt={c.coffee_name} style={s.matchThumb} />}
                  </div>
                  <div style={s.matchCandidateMeta}>
                    <p style={s.matchCandidateRoaster}>{c.roaster_name}</p>
                    <p style={s.matchCandidateName}>{c.coffee_name}</p>
                    {c.origin_country && <p style={s.matchCandidateOrigin}>{c.origin_country}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => acceptMatch(c)}
                    style={s.matchAcceptButton}
                  >
                    Rate this →
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={dismissMatch} style={s.matchDismissButton}>
              {matchResult.kind === 'strong' ? 'Not this one — add as new' : 'None of these — add as new'}
            </button>
          </div>
        )}

        {imagePreview && !matchResult && (
          <img src={imagePreview} alt="Bag preview" style={s.imagePreview} />
        )}

        <div style={{ ...s.form, marginTop: '1.5rem' }}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Roaster <span style={s.required}>*</span></label>
            <input style={s.input} type="text" value={coffee.roaster_name} onChange={(e) => setCoffee({ ...coffee, roaster_name: e.target.value })} placeholder="e.g. Sey Coffee" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Coffee name <span style={s.required}>*</span></label>
            <input style={s.input} type="text" value={coffee.coffee_name} onChange={(e) => setCoffee({ ...coffee, coffee_name: e.target.value })} placeholder="e.g. Hambela Hamasho" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Origin country <span style={s.required}>*</span></label>
            <input style={s.input} type="text" value={coffee.origin_country} onChange={(e) => setCoffee({ ...coffee, origin_country: e.target.value })} placeholder="e.g. Ethiopia" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Process <span style={s.required}>*</span></label>
            <select style={s.select} value={coffee.process} onChange={(e) => setCoffee({ ...coffee, process: e.target.value })}>
              <option value="">Select a process</option>
              {PROCESS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Process detail</label>
            <input style={s.input} type="text" value={coffee.process_detail} onChange={(e) => setCoffee({ ...coffee, process_detail: e.target.value })} placeholder="e.g. 72hr anaerobic" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Roast level <span style={s.required}>*</span></label>
            <select style={s.select} value={coffee.roaster_stated_roast_level} onChange={(e) => setCoffee({ ...coffee, roaster_stated_roast_level: e.target.value })}>
              <option value="">Select roast level</option>
              {ROAST_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Origin region</label>
            <input style={s.input} type="text" value={coffee.origin_region} onChange={(e) => setCoffee({ ...coffee, origin_region: e.target.value })} placeholder="e.g. Yirgacheffe" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Producer</label>
            <input style={s.input} type="text" value={coffee.producer} onChange={(e) => setCoffee({ ...coffee, producer: e.target.value })} placeholder="e.g. Hambela Estate" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Farm</label>
            <input style={s.input} type="text" value={coffee.farm} onChange={(e) => setCoffee({ ...coffee, farm: e.target.value })} placeholder="e.g. Finca Las Delicias" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Variety</label>
            <input style={s.input} type="text" value={coffee.variety} onChange={(e) => setCoffee({ ...coffee, variety: e.target.value })} placeholder="e.g. Heirloom, Bourbon" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Elevation (masl)</label>
            <input style={s.input} type="number" value={coffee.elevation_masl} onChange={(e) => setCoffee({ ...coffee, elevation_masl: e.target.value })} placeholder="e.g. 2000" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Roaster's tasting notes</label>
            <input style={s.input} type="text" value={coffee.roaster_tasting_notes} onChange={(e) => setCoffee({ ...coffee, roaster_tasting_notes: e.target.value })} placeholder="e.g. blueberry, dark chocolate, cherry" />
            <p style={s.helperText}>Comma-separated. From the bag.</p>
          </div>

          {saveError && <p style={s.error}>{saveError}</p>}

          <button
            onClick={handleSaveCoffee}
            disabled={!canSave || saving || scanning || matchResult !== null}
            style={{
              ...s.primaryButton,
              ...(!canSave || saving || scanning || matchResult !== null ? s.disabledButton : {}),
            }}
          >
            {saving ? 'Saving…' : 'Save & Rate →'}
          </button>
        </div>
      </div>
    )
  }

  // step === 'rate'
  if (!savedCoffee) return null

  return (
    <div style={s.container}>
      <button onClick={() => setStep('details')} style={s.backLink}>← Back to details</button>
      <p style={s.stepEyebrow}>Step 3 of 3</p>
      <h2 style={s.heading}>Rate it</h2>

      {/* Coffee context */}
      <div style={s.coffeeContext}>
        {savedCoffee.imageUrl ? (
          <img src={savedCoffee.imageUrl} alt={savedCoffee.name} style={s.coffeeContextImage} />
        ) : (
          <div style={s.coffeeContextImage} />
        )}
        <div>
          <span style={{ ...s.label, margin: 0 }}>{savedCoffee.roaster}</span>
          <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '1.5rem', color: espresso, margin: '0.15rem 0 0', lineHeight: 1.15 }}>
            {savedCoffee.name}
          </h3>
        </div>
      </div>

      <RatingForm onSubmit={handleSubmitRating} submitLabel="Log it" />
    </div>
  )
}
