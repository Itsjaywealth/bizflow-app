import React from 'react'
import { Toaster } from 'react-hot-toast'

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-modal dark:border-neutral-800 dark:bg-neutral-900 dark:text-white',
      }}
    />
  )
}
