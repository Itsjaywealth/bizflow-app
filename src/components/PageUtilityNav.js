import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function PageUtilityNav({ backTo = '/home', backLabel = 'Homepage' }) {
  return (
    <div className="page-utility-nav">
      <Link to={backTo} className="home-link">
        <span aria-hidden="true">←</span>
        <span>{backLabel}</span>
      </Link>
      <ThemeToggle compact />
    </div>
  )
}
