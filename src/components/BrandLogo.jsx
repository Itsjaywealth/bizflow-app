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
      <span className="brand-logo-glow relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow transition-transform duration-300 hover:scale-[1.03]">
        <span className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
        <span className="relative text-sm font-black tracking-[0.28em] text-white">BF</span>
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
