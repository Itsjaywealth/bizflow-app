import { useMemo, useState } from 'react'

export default function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return {
    page,
    pageCount,
    pageSize,
    setPage,
    nextPage: () => setPage((current) => Math.min(current + 1, pageCount)),
    previousPage: () => setPage((current) => Math.max(current - 1, 1)),
    paginatedItems,
  }
}
