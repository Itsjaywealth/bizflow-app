import { supabase } from './supabase'

const DEFAULT_SIGNED_URL_TTL = 60 * 10

export async function createSignedStorageUrl(bucket, path, options = {}) {
  if (!bucket || !path) {
    throw new Error('A storage bucket and file path are required.')
  }

  const { expiresIn = DEFAULT_SIGNED_URL_TTL, download = false } = options
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn, { download })

  if (error) throw error

  return data?.signedUrl || ''
}

export async function openSignedStorageUrl(bucket, path, options = {}) {
  const signedUrl = await createSignedStorageUrl(bucket, path, options)
  if (signedUrl && typeof window !== 'undefined') {
    window.open(signedUrl, '_blank', 'noopener,noreferrer')
  }
  return signedUrl
}
