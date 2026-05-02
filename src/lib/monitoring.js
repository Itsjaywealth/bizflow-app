import { trackError } from './analytics'

export function registerClientMonitoring() {
  if (typeof window === 'undefined' || window.__bizflowMonitoringRegistered) return

  window.__bizflowMonitoringRegistered = true

  window.addEventListener('error', (event) => {
    trackError('window.error', event.error || event.message, {
      filename: event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    trackError('window.unhandledrejection', event.reason)
  })
}
