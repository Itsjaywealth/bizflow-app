const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

export const uploadPresets = {
  businessLogo: {
    label: 'Logo',
    maxSizeMB: 5,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  profilePhoto: {
    label: 'Image',
    maxSizeMB: 5,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  clientFile: {
    label: 'Client file',
    maxSizeMB: 10,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
  },
  staffDocument: {
    label: 'Staff document',
    maxSizeMB: 10,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
  },
}

function formatAllowedTypes(allowedMimeTypes) {
  return allowedMimeTypes
    .map((mimeType) => mimeType.split('/').pop()?.toUpperCase() || mimeType)
    .join(', ')
}

export function validateUploadFile(file, preset) {
  if (!file) {
    throw new Error('No file selected.')
  }

  if (!preset) {
    throw new Error('No upload policy was provided.')
  }

  const maxBytes = preset.maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error(`${preset.label} must be ${preset.maxSizeMB}MB or smaller.`)
  }

  if (preset.allowedMimeTypes?.length && !preset.allowedMimeTypes.includes(file.type)) {
    throw new Error(`${preset.label} must be one of: ${formatAllowedTypes(preset.allowedMimeTypes)}.`)
  }

  return true
}
