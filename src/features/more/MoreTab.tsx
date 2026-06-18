import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { track } from '../../lib/track'
import {
  Q2_OPTIONS,
  Q5_OPTIONS,
  type ExperienceLevel,
} from '../quiz/quizConfig'
import {
  fetchPalateProfile,
  updatePalateProfile,
  type PalateProfileRow,
} from '../quiz/palateProfile'
import { fetchUserProfile, saveUserProfile } from './settings'
import { TheStory } from './TheStory'

const espresso = '#1E1410'
const ember = '#D94E1F'
const ochre = '#C89040'
const ink70 = 'rgba(30,20,16,0.70)'
const ink50 = 'rgba(30,20,16,0.50)'
const ink15 = 'rgba(30,20,16,0.15)'
const ink08 = 'rgba(30,20,16,0.08)'
const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']

const s = {
  container: { marginTop: '2rem', maxWidth: '600px' } as const,
  eyebrow: {
    fontFamily: sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: ember,
    margin: '0 0 0.5rem',
  } as const,
  pageTitle: {
    fontFamily: serif,
    fontWeight: 400,
    fontSize: '44px',
    lineHeight: 1.02,
    letterSpacing: '-0.4px',
    margin: '0 0 2.5rem',
  } as const,
  section: { marginBottom: '2.5rem' } as const,
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    margin: '0 0 1rem',
  } as const,
  sectionTitle: {
    fontFamily: sans,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: ink50,
    margin: 0,
  } as const,
  comingSoon: {
    fontFamily: sans,
    fontSize: '0.62rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#7A5A1E',
    background: 'rgba(200,144,64,0.18)',
    border: `1px solid ${ochre}`,
    borderRadius: '100px',
    padding: '0.15rem 0.6rem',
  } as const,
  card: {
    border: `1px solid ${ink15}`,
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.18)',
    padding: '1.25rem',
  } as const,
  field: { marginBottom: '1.25rem' } as const,
  label: {
    display: 'block',
    fontFamily: sans,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: ink70,
    margin: '0 0 0.4rem',
  } as const,
  input: {
    width: '100%',
    boxSizing: 'border-box' as const,
    fontFamily: sans,
    fontSize: '0.95rem',
    padding: '0.6rem 0.8rem',
    border: `1px solid ${ink15}`,
    borderRadius: '8px',
    background: '#FAF5EB',
    color: espresso,
    outline: 'none',
  } as const,
  chipRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem' } as const,
  chip: (on: boolean) =>
    ({
      padding: '0.45rem 0.9rem',
      borderRadius: '100px',
      border: `1.5px solid ${on ? ember : ink15}`,
      background: on ? 'rgba(217,78,31,0.06)' : 'transparent',
      color: espresso,
      fontFamily: sans,
      fontSize: '0.85rem',
      cursor: 'pointer',
    }) as const,
  saved: {
    fontFamily: sans,
    fontSize: '0.72rem',
    color: ochre,
    marginLeft: '0.5rem',
  } as const,
  rowBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '1rem 1.25rem',
    border: `1px solid ${ink15}`,
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.18)',
    color: espresso,
    fontFamily: sans,
    fontSize: '0.95rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    marginBottom: '0.6rem',
  } as const,
  rowChevron: { color: ink50, fontSize: '1.1rem' } as const,
  stubRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    border: `1px solid ${ink08}`,
    borderRadius: '12px',
    background: 'transparent',
    marginBottom: '0.6rem',
    opacity: 0.75,
  } as const,
  stubText: { fontFamily: sans, fontSize: '0.95rem', color: ink70 } as const,
  signOut: {
    marginTop: '1rem',
    padding: '0.7rem 1.5rem',
    background: 'none',
    border: `1px solid ${ink15}`,
    borderRadius: '100px',
    fontFamily: sans,
    fontSize: '0.9rem',
    color: espresso,
    cursor: 'pointer',
  } as const,
  feedbackArea: {
    width: '100%',
    boxSizing: 'border-box' as const,
    minHeight: '90px',
    fontFamily: sans,
    fontSize: '0.95rem',
    padding: '0.7rem 0.8rem',
    border: `1px solid ${ink15}`,
    borderRadius: '8px',
    background: '#FAF5EB',
    color: espresso,
    resize: 'vertical' as const,
    outline: 'none',
  } as const,
  primaryBtn: {
    marginTop: '0.75rem',
    padding: '0.6rem 1.4rem',
    background: ember,
    color: '#F4EAD5',
    border: 'none',
    borderRadius: '100px',
    fontFamily: sans,
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
}

function SectionHead({ title, comingSoon }: { title: string; comingSoon?: boolean }) {
  return (
    <div style={s.sectionHead}>
      <p style={s.sectionTitle}>{title}</p>
      {comingSoon && <span style={s.comingSoon}>Coming Soon</span>}
    </div>
  )
}

function StubToggle() {
  return (
    <div
      style={{
        width: '38px',
        height: '22px',
        borderRadius: '100px',
        background: ink15,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#FAF5EB',
          position: 'absolute',
          top: '3px',
          left: '3px',
        }}
      />
    </div>
  )
}

type Props = {
  onRetakeQuiz: () => void
  onOpenFlavors: () => void
  onSignOut: () => void
}

export function MoreTab({ onRetakeQuiz, onOpenFlavors, onSignOut }: Props) {
  const { user } = useAuth()
  const [story, setStory] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [palate, setPalate] = useState<PalateProfileRow | null>(null)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)

  const [feedback, setFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    Promise.all([fetchUserProfile(user.id), fetchPalateProfile(user.id)]).then(
      ([prof, pal]) => {
        if (cancelled) return
        setDisplayName(prof?.display_name ?? '')
        setLocation(prof?.location ?? '')
        setPalate(pal)
      },
    )
    return () => {
      cancelled = true
    }
  }, [user])

  const flash = (what: string) => {
    setSavedFlash(what)
    setTimeout(() => setSavedFlash((cur) => (cur === what ? null : cur)), 1800)
  }

  const saveProfileField = async (patch: { display_name?: string; location?: string }) => {
    if (!user) return
    await saveUserProfile(user.id, patch)
    flash('profile')
  }

  const savePalate = async (
    patch: Partial<Pick<PalateProfileRow, 'experience_level' | 'aspiration' | 'brew_methods'>>,
    key: string,
  ) => {
    if (!user || !palate) return
    const next = await updatePalateProfile(user.id, patch)
    if (next) setPalate(next)
    flash(key)
  }

  const toggleBrew = (method: string) => {
    if (!palate) return
    const has = (palate.brew_methods ?? []).includes(method)
    const brew_methods = has
      ? (palate.brew_methods ?? []).filter((m) => m !== method)
      : [...(palate.brew_methods ?? []), method]
    savePalate({ brew_methods }, 'brew')
  }

  const submitFeedback = () => {
    const message = feedback.trim()
    if (!message) return
    track('feedback_submitted', { message })
    setFeedback('')
    setFeedbackSent(true)
  }

  if (story) return <TheStory onBack={() => setStory(false)} />

  const initials = (displayName || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <div style={s.container}>
      <p style={s.eyebrow}>More</p>
      <h1 style={s.pageTitle}>Settings</h1>

      {/* Profile (functional) */}
      <section style={s.section}>
        <SectionHead title="Profile" />
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(217,78,31,0.12)',
                color: ember,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: serif,
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <span style={{ fontFamily: sans, fontSize: '0.8rem', color: ink50 }}>
              {user?.email}
            </span>
          </div>

          <div style={s.field}>
            <label style={s.label}>
              Display name
              {savedFlash === 'profile' && <span style={s.saved}>Saved</span>}
            </label>
            <input
              style={s.input}
              value={displayName}
              placeholder="Your name"
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => saveProfileField({ display_name: displayName })}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Experience level{savedFlash === 'exp' && <span style={s.saved}>Saved</span>}</label>
            <div style={s.chipRow}>
              {EXPERIENCE_OPTIONS.map((lvl) => (
                <button
                  key={lvl}
                  style={s.chip(palate?.experience_level === lvl)}
                  onClick={() => savePalate({ experience_level: lvl }, 'exp')}
                  disabled={!palate}
                >
                  {lvl[0].toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...s.field, marginBottom: 0 }}>
            <label style={s.label}>
              Location{savedFlash === 'profile' && <span style={s.saved}>Saved</span>}
            </label>
            <input
              style={s.input}
              value={location}
              placeholder="City or region"
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => saveProfileField({ location })}
            />
          </div>
        </div>
      </section>

      {/* Preferred brew methods (functional) */}
      <section style={s.section}>
        <SectionHead title="Preferred brew methods" />
        <div style={s.card}>
          <div style={s.chipRow}>
            {Q5_OPTIONS.map((m) => (
              <button
                key={m}
                style={s.chip((palate?.brew_methods ?? []).includes(m))}
                onClick={() => toggleBrew(m)}
                disabled={!palate}
              >
                {m}
              </button>
            ))}
          </div>
          {savedFlash === 'brew' && <span style={s.saved}>Saved</span>}
        </div>
      </section>

      {/* What you want from Palato — aspiration (functional, drives §5) */}
      <section style={s.section}>
        <SectionHead title="What you want from Palato" />
        <div style={s.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Q2_OPTIONS.map((opt) => (
              <button
                key={opt}
                style={{
                  ...s.chip(palate?.aspiration === opt),
                  textAlign: 'left',
                  padding: '0.6rem 0.9rem',
                }}
                onClick={() => savePalate({ aspiration: opt }, 'asp')}
                disabled={!palate}
              >
                {opt}
              </button>
            ))}
          </div>
          {savedFlash === 'asp' && <span style={s.saved}>Saved — your Palate emphasis updates</span>}
        </div>
      </section>

      {/* Functional navigation rows */}
      <section style={s.section}>
        <SectionHead title="Your palate" />
        <button style={s.rowBtn} onClick={onRetakeQuiz}>
          Retake the palate quiz <span style={s.rowChevron}>→</span>
        </button>
        <button style={s.rowBtn} onClick={onOpenFlavors}>
          Flavor taxonomy <span style={s.rowChevron}>→</span>
        </button>
        <button style={s.rowBtn} onClick={() => setStory(true)}>
          The story <span style={s.rowChevron}>→</span>
        </button>
      </section>

      {/* Send feedback (functional → captured to analytics) */}
      <section style={s.section}>
        <SectionHead title="Send feedback" />
        <div style={s.card}>
          {feedbackSent ? (
            <p style={{ fontFamily: serif, fontSize: '1.2rem', color: espresso, margin: 0 }}>
              Thank you — we read every note.
            </p>
          ) : (
            <>
              <textarea
                style={s.feedbackArea}
                value={feedback}
                placeholder="What's working, what's missing, what you'd love to see."
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button style={s.primaryBtn} onClick={submitFeedback} disabled={!feedback.trim()}>
                Send feedback
              </button>
            </>
          )}
        </div>
      </section>

      {/* Coming Soon stubs */}
      <section style={s.section}>
        <SectionHead title="Notifications" comingSoon />
        {['New releases from roasters you follow', 'Weekly palate digest', "A recommendation's ready"].map(
          (label) => (
            <div key={label} style={s.stubRow}>
              <span style={s.stubText}>{label}</span>
              <StubToggle />
            </div>
          ),
        )}
      </section>

      <section style={s.section}>
        <SectionHead title="Units" comingSoon />
        <div style={s.stubRow}>
          <span style={s.stubText}>Weight — grams / oz</span>
          <StubToggle />
        </div>
        <div style={s.stubRow}>
          <span style={s.stubText}>Temperature — °C / °F</span>
          <StubToggle />
        </div>
      </section>

      <section style={s.section}>
        <SectionHead title="Roasters you follow" comingSoon />
        <div style={s.stubRow}>
          <span style={s.stubText}>Follow roasters to track new releases</span>
        </div>
      </section>

      <section style={s.section}>
        <SectionHead title="Your data" comingSoon />
        <div style={s.stubRow}>
          <span style={s.stubText}>Export your ratings to CSV</span>
        </div>
        <div style={s.stubRow}>
          <span style={s.stubText}>Delete account</span>
        </div>
      </section>

      {/* Sign out (functional) */}
      <section style={{ ...s.section, marginBottom: 0 }}>
        <SectionHead title="Account" />
        <button style={s.signOut} onClick={onSignOut}>
          Sign out
        </button>
      </section>
    </div>
  )
}
