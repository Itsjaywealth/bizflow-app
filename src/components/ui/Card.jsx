import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={[
        'rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-card backdrop-blur transition-all duration-300 dark:border-brand-glow/10 dark:bg-white/5',
        hover ? 'hover:-translate-y-0.5 hover:shadow-modal' : '',
        className,
      ].join(' ').trim()}
      {...props}
    >
      {children}
    </motion.div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
}
