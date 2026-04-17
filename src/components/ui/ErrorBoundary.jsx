import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 text-center shadow-card">
          <div className="max-w-md space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-danger">Something went wrong</p>
            <h2 className="text-2xl font-bold text-neutral-900">This view hit an unexpected issue.</h2>
            <p className="text-sm leading-6 text-neutral-500">
              Refresh the page to try again. If the problem keeps coming back, we can review the component safely.
            </p>
            <Button onClick={() => window.location.reload()}>Refresh page</Button>
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
}
