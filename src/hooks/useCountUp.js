import { useEffect, useMemo, useState } from 'react'

export default function useCountUp(target, duration = 900) {
  const safeTarget = useMemo(() => Number(target || 0), [target])
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frameId
    let startTime

    function animate(now) {
      if (!startTime) startTime = now
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(safeTarget * eased))
      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate)
      }
    }

    setValue(0)
    frameId = window.requestAnimationFrame(animate)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [duration, safeTarget])

  return value
}
