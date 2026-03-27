export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (nextPage: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div style={{ color: 'var(--text-2)', fontSize: 13 }}>
        Страница <strong>{page}</strong> из <strong>{totalPages}</strong> • Всего: <strong>{total}</strong>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn" disabled={!canPrev} onClick={() => onChange(1)}>
          «
        </button>
        <button className="btn" disabled={!canPrev} onClick={() => onChange(page - 1)}>
          Назад
        </button>
        <button className="btn" disabled={!canNext} onClick={() => onChange(page + 1)}>
          Далее
        </button>
        <button className="btn" disabled={!canNext} onClick={() => onChange(totalPages)}>
          »
        </button>
      </div>
    </div>
  )
}

