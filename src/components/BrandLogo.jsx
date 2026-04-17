import React from 'react'
import PropTypes from 'prop-types'

export default function BrandLogo({
  compact = false,
  showTagline = true,
  className = '',
  textClassName = '',
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span className="brand-logo-glow relative inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-[1.03]">
        <img
          src="/logo.svg"
          alt="BizFlow NG logo"
          width="48"
          height="48"
          decoding="async"
          className="h-12 w-12 rounded-2xl object-contain"
        />
      </span>
      {!compact ? (
        <span className={`block ${textClassName}`.trim()}>
          <span className="block text-lg font-black tracking-tight text-neutral-950 dark:text-white">BizFlow NG</span>
          {showTagline ? (
            <span className="mt-0.5 block text-xs font-medium text-neutral-500 dark:text-neutral-300">
              Business operations hub
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

BrandLogo.propTypes = {
  compact: PropTypes.bool,
  showTagline: PropTypes.bool,
  className: PropTypes.string,
  textClassName: PropTypes.string,
}
