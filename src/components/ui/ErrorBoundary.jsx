import React from 'react'
import PropTypes from 'prop-types'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    const details = {
      boundaryName: this.props.boundaryName || 'ErrorBoundary',
      routeName: this.props.routeName || null,
      message: error?.message || 'Unknown render error',
      stack: error?.stack || null,
      componentStack: info?.componentStack || null,
    }

    console.error('[ErrorBoundary]', details)

    if (this.props.onError) {
      this.props.onError(error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV !== 'production'
      return (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 text-center shadow-card">
          <div className="max-w-md space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-danger">Something went wrong</p>
            <h2 className="text-2xl font-bold text-neutral-900">This view hit an unexpected issue.</h2>
            <p className="text-sm leading-6 text-neutral-500">
              Refresh the page to try again. If the problem keeps coming back, we can review the component safely.
            </p>
            {isDev ? (
              <p className="text-xs leading-5 text-neutral-400">
                Boundary: {this.props.boundaryName || 'ErrorBoundary'}
                {this.props.routeName ? ` • Route: ${this.props.routeName}` : ''}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-gradient px-5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  boundaryName: PropTypes.string,
  routeName: PropTypes.string,
}
