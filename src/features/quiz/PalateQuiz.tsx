import { useEffect, useState } from 'react'
import { GradientSlider } from '../../components/GradientSlider'
import { track } from '../../lib/track'
import { useAuth } from '../../lib/auth'
import { PalatoWordmark } from '../../components/PalatoWordmark'
import {
  EMPTY_ANSWERS,
  type QuizAnswers,
  Q1_PROMPT,
  Q1_OPTIONS,
  Q2_PROMPT,
  Q2_OPTIONS,
  Q2_VALUE_BACK,
  Q3_PROMPT,
  Q3_LEFT_LABEL,
  Q3_RIGHT_LABEL,
  Q3_UNSURE_LABEL,
  Q3_FACT,
  flavorDescriptor,
  deriveRoast,
  Q4_PROMPT,
  Q4_OPTIONS,
  Q5_PROMPT,
  Q5_OPTIONS,
  brewValueBack,
  REVEAL_HEADLINE,
  WHY_PALATO_TITLE,
  WHY_PALATO_BODY,
  REVEAL_CTA,
  REVEAL_CTA_SUBLINE,
  startingPalateLine,
  aspirationCallback,
  saveQuizResult,
} from './quizConfig'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'
const ochre = '#C89040'

const TOTAL_STEPS = 5

const serif = '"Instrument Serif", serif'
const sans = 'Geist, system-ui, sans-serif'

const pageStyle = {
  padding: '2rem 1.5rem 4rem',
  fontFamily: sans,
  backgroundColor: cream,
  minHeight: '100vh',
  color: espresso,
  maxWidth: '640px',
  width: '100%',
  margin: '0 auto',
  boxSizing: 'border-box' as const,
  textAlign: 'left' as const,
  backgroundImage:
    'radial-gradient(rgba(30,20,16,0.025) 1px, transparent 1px), radial-gradient(rgba(30,20,16,0.02) 1px, transparent 1px)',
  backgroundSize: '3px 3px, 7px 7px',
  backgroundPosition: '0 0, 1px 2px',
} as const

function ProgressBar({ step }: { step: number }) {
  // step is 0-indexed across the 5 questions; fill reflects current question.
  const pct = Math.min(100, Math.round(((step + 1) / TOTAL_STEPS) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
      <div
        style={{
          flex: 1,
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'rgba(30, 20, 16, 0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: ember,
            transition: 'width 350ms ease-out',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: espresso,
          opacity: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        {step + 1} of {TOTAL_STEPS}
      </span>
    </div>
  )
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: serif,
        fontSize: '2rem',
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        margin: '0 0 1.75rem',
        color: espresso,
      }}
    >
      {children}
    </h1>
  )
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '1rem 1.15rem',
        marginBottom: '0.65rem',
        borderRadius: '12px',
        border: `1.5px solid ${selected ? ember : 'rgba(30, 20, 16, 0.18)'}`,
        backgroundColor: selected ? 'rgba(217, 78, 31, 0.06)' : 'transparent',
        color: espresso,
        fontFamily: sans,
        fontSize: '1rem',
        lineHeight: 1.35,
        cursor: 'pointer',
        transition: 'border-color 200ms ease-out, background-color 200ms ease-out',
      }}
    >
      {label}
    </button>
  )
}

function ValueBack({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null
  return (
    <div
      style={{
        marginTop: '1.5rem',
        paddingLeft: '1rem',
        borderLeft: `2px solid ${ochre}`,
        animation: 'quizFade 350ms ease-out',
      }}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: serif,
            fontSize: '1.2rem',
            lineHeight: 1.4,
            color: espresso,
            opacity: 0.85,
            margin: i > 0 ? '0.75rem 0 0' : 0,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: '2rem',
        padding: '0.85rem 2rem',
        backgroundColor: ember,
        color: cream,
        border: 'none',
        borderRadius: '100px',
        fontSize: '1rem',
        fontFamily: sans,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 200ms ease-out',
      }}
    >
      {children}
    </button>
  )
}

export function PalateQuiz() {
  const { signInWithGoogle } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS)

  // Q3 local working state
  const [flavorLean, setFlavorLean] = useState(50)
  const [flavorUnsure, setFlavorUnsure] = useState(false)

  // Activation funnel (Decision #049): quiz_started → quiz_completed →
  // sign-in → first rating_saved. These two fire pre-auth (anonymous);
  // PostHog stitches them to the user on identify() at sign-in.
  useEffect(() => {
    track('quiz_started')
  }, [])

  useEffect(() => {
    if (step >= TOTAL_STEPS) {
      track('quiz_completed', {
        experienceLevel: answers.experience_level,
        aspiration: answers.aspiration,
        originAffinity: answers.origin_affinity,
        flavorUnsure: answers.flavor_unsure,
      })
    }
  }, [step, answers])

  const goNext = () => setStep((s) => s + 1)
  const goBack = () => setStep((s) => Math.max(0, s - 1))

  const update = (patch: Partial<QuizAnswers>) => setAnswers((a) => ({ ...a, ...patch }))

  const onSignIn = async () => {
    track('quiz_signin_clicked', { aspiration: answers.aspiration })
    saveQuizResult(answers)
    await signInWithGoogle()
  }

  // ---- Reveal -------------------------------------------------------------
  if (step >= TOTAL_STEPS) {
    const callback = aspirationCallback(answers.aspiration)
    return (
      <div className="palato-page" style={pageStyle}>
        <PalatoWordmark color={espresso} style={{ height: '1.8rem', width: 'auto', marginBottom: '2.5rem' }} />
        <Prompt>{REVEAL_HEADLINE}</Prompt>
        {callback && (
          <p style={{ fontFamily: serif, fontSize: '1.3rem', lineHeight: 1.4, margin: '0 0 1.25rem', opacity: 0.9 }}>
            {callback}
          </p>
        )}
        <p style={{ fontFamily: sans, fontSize: '1rem', lineHeight: 1.5, margin: '0 0 2.5rem', color: espresso }}>
          {startingPalateLine(answers)}
        </p>

        <div
          style={{
            borderTop: `1px solid rgba(30, 20, 16, 0.15)`,
            borderBottom: `1px solid rgba(30, 20, 16, 0.15)`,
            padding: '1.75rem 0',
            margin: '0 0 2.5rem',
          }}
        >
          <p
            style={{
              fontFamily: sans,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: ember,
              margin: '0 0 0.75rem',
            }}
          >
            {WHY_PALATO_TITLE}
          </p>
          <p style={{ fontFamily: serif, fontSize: '1.35rem', lineHeight: 1.45, color: espresso, margin: 0 }}>
            {WHY_PALATO_BODY}
          </p>
        </div>

        <PrimaryButton onClick={onSignIn}>{REVEAL_CTA}</PrimaryButton>
        <p style={{ fontFamily: sans, fontSize: '0.85rem', opacity: 0.6, margin: '0.85rem 0 0' }}>
          {REVEAL_CTA_SUBLINE}
        </p>

        <QuizStyles />
      </div>
    )
  }

  // ---- Questions ----------------------------------------------------------
  return (
    <div className="palato-page" style={pageStyle}>
      <ProgressBar step={step} />

      <div key={step} style={{ animation: 'quizSlide 350ms ease-out' }}>
        {step === 0 && (
          <QuestionScreen
            prompt={Q1_PROMPT}
            valueBackLines={answers.motivation ? [Q1_OPTIONS.find((o) => o.label === answers.motivation)!.valueBack] : []}
            canContinue={answers.motivation !== null}
            onContinue={goNext}
            onBack={null}
          >
            {Q1_OPTIONS.map((o) => (
              <OptionButton
                key={o.label}
                label={o.label}
                selected={answers.motivation === o.label}
                onClick={() => update({ motivation: o.label, experience_level: o.experience })}
              />
            ))}
          </QuestionScreen>
        )}

        {step === 1 && (
          <QuestionScreen
            prompt={Q2_PROMPT}
            valueBackLines={answers.aspiration ? [Q2_VALUE_BACK] : []}
            canContinue={answers.aspiration !== null}
            onContinue={goNext}
            onBack={goBack}
          >
            {Q2_OPTIONS.map((label) => (
              <OptionButton
                key={label}
                label={label}
                selected={answers.aspiration === label}
                onClick={() => update({ aspiration: label })}
              />
            ))}
          </QuestionScreen>
        )}

        {step === 2 && (
          <QuestionScreen
            prompt={Q3_PROMPT}
            valueBackLines={[Q3_FACT]}
            canContinue
            onContinue={() => {
              if (flavorUnsure) {
                update({ flavor_lean: null, flavor_unsure: true, roast_preference: null })
              } else {
                update({
                  flavor_lean: flavorLean,
                  flavor_unsure: false,
                  roast_preference: deriveRoast(flavorLean, false),
                })
              }
              goNext()
            }}
            onBack={goBack}
          >
            <div style={{ opacity: flavorUnsure ? 0.4 : 1, transition: 'opacity 200ms ease-out' }}>
              <p
                style={{
                  fontFamily: serif,
                  fontSize: '1.4rem',
                  textAlign: 'center',
                  margin: '0 0 1.25rem',
                  color: ember,
                }}
              >
                {flavorDescriptor(flavorUnsure ? null : flavorLean)}
              </p>
              <GradientSlider
                value={flavorLean / 100}
                onChange={(v) => {
                  setFlavorLean(Math.round(v * 100))
                  setFlavorUnsure(false)
                }}
                leftLabel={Q3_LEFT_LABEL}
                rightLabel={Q3_RIGHT_LABEL}
              />
            </div>
            <button
              onClick={() => setFlavorUnsure((u) => !u)}
              style={{
                marginTop: '1.5rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '100px',
                border: `1.5px solid ${flavorUnsure ? ember : 'rgba(30, 20, 16, 0.25)'}`,
                backgroundColor: flavorUnsure ? 'rgba(217, 78, 31, 0.06)' : 'transparent',
                color: espresso,
                fontFamily: sans,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {Q3_UNSURE_LABEL}
            </button>
          </QuestionScreen>
        )}

        {step === 3 && (
          <QuestionScreen
            prompt={Q4_PROMPT}
            valueBackLines={
              answers.origin_affinity
                ? [Q4_OPTIONS.find((o) => o.label === answers.origin_affinity)!.valueBack]
                : []
            }
            canContinue={answers.origin_affinity !== null}
            onContinue={goNext}
            onBack={goBack}
          >
            {Q4_OPTIONS.map((o) => (
              <OptionButton
                key={o.label}
                label={o.label}
                selected={answers.origin_affinity === o.label}
                onClick={() => update({ origin_affinity: o.label })}
              />
            ))}
          </QuestionScreen>
        )}

        {step === 4 && (
          <QuestionScreen
            prompt={Q5_PROMPT}
            valueBackLines={answers.brew_methods.length > 0 ? brewValueBack(answers.brew_methods) : []}
            canContinue={answers.brew_methods.length > 0}
            onContinue={goNext}
            onBack={goBack}
            continueLabel="See my palate"
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {Q5_OPTIONS.map((label) => {
                const selected = answers.brew_methods.includes(label)
                return (
                  <button
                    key={label}
                    onClick={() =>
                      update({
                        brew_methods: selected
                          ? answers.brew_methods.filter((m) => m !== label)
                          : [...answers.brew_methods, label],
                      })
                    }
                    style={{
                      padding: '0.6rem 1.1rem',
                      borderRadius: '100px',
                      border: `1.5px solid ${selected ? ember : 'rgba(30, 20, 16, 0.18)'}`,
                      backgroundColor: selected ? 'rgba(217, 78, 31, 0.06)' : 'transparent',
                      color: espresso,
                      fontFamily: sans,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'border-color 200ms ease-out, background-color 200ms ease-out',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </QuestionScreen>
        )}
      </div>

      <QuizStyles />
    </div>
  )
}

function QuestionScreen({
  prompt,
  children,
  valueBackLines,
  canContinue,
  onContinue,
  onBack,
  continueLabel = 'Continue',
}: {
  prompt: string
  children: React.ReactNode
  valueBackLines: string[]
  canContinue: boolean
  onContinue: () => void
  onBack: (() => void) | null
  continueLabel?: string
}) {
  return (
    <div>
      <Prompt>{prompt}</Prompt>
      {children}
      <ValueBack lines={valueBackLines} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>
          {continueLabel}
        </PrimaryButton>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginTop: '2rem',
              background: 'none',
              border: 'none',
              color: espresso,
              opacity: 0.5,
              fontFamily: sans,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}

function QuizStyles() {
  return (
    <style>{`
      @keyframes quizFade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes quizSlide {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  )
}
