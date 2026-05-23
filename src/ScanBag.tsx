import { useState, type ChangeEvent } from 'react'
import { useAuth } from './lib/auth'
import { prepareImage, uploadBagImage } from './lib/bagImage'

export function ScanBag() {
  const { user } = useAuth()
  const [preview, setPreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setError(null)
    setImageUrl(null)
    setBusy(true)
    try {
      const ready = await prepareImage(file)
      setPreview(URL.createObjectURL(ready))
      const url = await uploadBagImage(ready, user.id)
      setImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
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

      {busy && <p style={{ opacity: 0.6, marginTop: '1rem' }}>Uploading…</p>}
      {error && <p style={{ color: '#D94E1F', marginTop: '1rem' }}>{error}</p>}
      {preview && (
        <img src={preview} alt="bag preview" style={{ display: 'block', maxWidth: 200, borderRadius: 8, marginTop: '1rem' }} />
      )}
      {imageUrl && (
        <p style={{ fontSize: '0.8rem', marginTop: '1rem', wordBreak: 'break-all', opacity: 0.7 }}>
          Uploaded. URL:<br />
          {imageUrl}
        </p>
      )}
    </div>
  )
}