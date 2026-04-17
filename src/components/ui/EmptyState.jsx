import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

export default function EmptyState({
  illustration = null,
  title,
  description,
  ctaLabel,
  onCta,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center shadow-card">
      {illustration ? <div className="mx-auto mb-4 flex justify-center">{illustration}</div> : null}
      <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">{description}</p>
      {ctaLabel ? (
        <div className="mt-6">
          <Button onClick={onCta}>{ctaLabel}</Button>
        </div>
      ) : null}
    </div>
  )
}

EmptyState.propTypes = {
  illustration: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  ctaLabel: PropTypes.string,
  onCta: PropTypes.func,
}
