const ANALYTICS_ENDPOINT = process.env.REACT_APP_ANALYTICS_ENDPOINT || ''

function getBasePayload(eventName, properties = {}) {
  return {
    event: eventName,
    properties: {
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      ...properties,
    },
    timestamp: new Date().toISOString(),
  }
}

export function trackEvent(eventName, properties = {}) {
  if (typeof window === 'undefined' || !eventName) return

  const payload = getBasePayload(eventName, properties)

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload.properties)
  }

  if (typeof window.plausible === 'function') {
    window.plausible(eventName, { props: payload.properties })
  }

  if (ANALYTICS_ENDPOINT && navigator.sendBeacon) {
    const body = JSON.stringify(payload)
    navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([body], { type: 'application/json' }))
  }
}

export function trackError(source, error, properties = {}) {
  trackEvent('client_error', {
    source,
    message: error?.message || String(error || 'Unknown error'),
    ...properties,
  })
}
