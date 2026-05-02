import { trackError } from './analytics'

export function registerClientMonitoring() {
  if (typeof window === 'undefined' || window.__bizflowMonitoringRegistered) return

  window.__bizflowMonitoringRegistered = true

  window.addEventListener('error', (event) => {
    if (window.Sentry?.captureException) {
      window.Sentry.captureException(event.error || new Error(event.message || 'Window error'))
    }
    trackError('window.error', event.error || event.message, {
      filename: event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (window.Sentry?.captureException) {
      window.Sentry.captureException(event.reason)
    }
    trackError('window.unhandledrejection', event.reason)
  })
}
