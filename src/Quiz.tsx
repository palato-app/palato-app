import { PalateQuiz } from './features/quiz/PalateQuiz'

/**
 * Public palate quiz route at `/quiz` (§3) — runs entirely pre-auth.
 * Sign-in (and DB persistence, §3d) happens only at the reveal.
 */
export function Quiz() {
  return <PalateQuiz />
}
