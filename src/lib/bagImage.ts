import { supabase } from './supabase'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function isHeicFile(file: File): boolean {
  const ext = getExtension(file.name)
  return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif'
}

function isAllowedFile(file: File): boolean {
  const ext = getExtension(file.name)
  return ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME.includes(file.type)
}

// Validate + HEIC-convert. Returns an upload-ready File, or throws with a user-facing message.
export async function prepareImage(file: File): Promise<File> {
  if (!isAllowedFile(file)) throw new Error('JPEG, PNG, WebP, or HEIC only.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be smaller than 10MB.')

  if (!isHeicFile(file)) return file

  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
  const blob = Array.isArray(result) ? result[0] : result
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
}

// Upload to the bag-images bucket, return the public URL.
export async function uploadBagImage(file: File, userId: string): Promise<string> {
  const ext = getExtension(file.name) || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('bag-images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('bag-images').getPublicUrl(path)
  return data.publicUrl
}