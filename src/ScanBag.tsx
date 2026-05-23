import { useState, type ChangeEvent } from 'react'
import { useAuth } from './lib/auth'
import { supabase } from './lib/supabase'
import { prepareImage, uploadBagImage } from './lib/bagImage'

export function ScanBag() {
  const { user } = useAuth()
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<unknown | null>(null)
  const [logged, setLogged] = useState<string | null>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setError(null)
    setResult(null)
    setLogged(null)
    setBusy(true)
    try {
      setStatus('Preparing image…')
      const ready = await prepareImage(file)
      setPreview(URL.createObjectURL(ready))

      setStatus('Uploading…')
      const imageUrl = await uploadBagImage(ready, user.id)

      setStatus('Reading the bag…')
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed.')
      setResult(data)
      setStatus(null)

      // Log the scan — the immutable raw extraction, bedrock of the eval.
      const rawExtraction = data.extracted ?? data
      const { error: scanError } = await supabase.from('scans').insert({
        user_id: user.id,
        photo_url: imageUrl,
        raw_extraction: rawExtraction,
        model_version: data.model ?? null,
        prompt_version: data.promptVersion ?? null,
      })
      setLogged(scanError ? `Couldn't log scan: ${scanError.message}` : 'Logged to scans.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(30,20,16,0.15)' }}>
      <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '2rem', fontStyle: 'italic', margin: '0 0 0.5rem' }}>
        Scan a bag
      </h2>
      <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: '0 0 1.5rem' }}>Admin only — Step 2 test surface.</p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={handleFile}
        disabled={busy}
      />

      {preview && (
        <img src={preview} alt="bag preview" style={{ display: 'block', maxWidth: 200, borderRadius: 8, marginTop: '1rem' }} />
      )}
      {status && <p style={{ opacity: 0.6, marginTop: '1rem' }}>{status}</p>}
      {error && <p style={{ color: '#D94E1F', marginTop: '1rem' }}>{error}</p>}
      {logged && <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.75rem' }}>{logged}</p>}
      {result != null && (
        <pre style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(30,20,16,0.05)', borderRadius: 8, fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}