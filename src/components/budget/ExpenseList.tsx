import type { Expense } from '@/hooks/useBudget'
import { useTripStore } from '@/hooks/useTripStore'
import { formatLocalCurrency, formatBaseCurrency } from '@/lib/utils'

interface ExpenseListProps {
  expenses: Expense[]
  onRemove: (id: string) => Promise<void>
}

export function ExpenseList({ expenses, onRemove }: ExpenseListProps) {
  const activeTrip = useTripStore(s => s.getActiveTrip())
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))
  const localCurrency = activeTrip?.budget.localCurrency || ''
  const baseCurrency = activeTrip?.budget.baseCurrency || ''

  if (!sorted.length) {
    return (
      <p className="text-[11px] text-ink/50">
        尚未记录支出。
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((e) => (
        <div
          key={e.id}
          className="flex items-center justify-between rounded-3xl bg-card border border-border/50 px-4 py-3 shadow-sm transition-all active:bg-paper"
        >
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-vermillion/10 flex items-center justify-center text-xs">
              {iconForCategory(e.category)}
            </span>
            <div className="text-[11px]">
              <p className="font-medium text-ink">
                {e.note || e.category}
              </p>
              <p className="text-ink/60">
                {e.category} · 第{e.day}天
              </p>
            </div>
          </div>
          <div className="text-right text-[11px]">
            <p className="font-semibold text-ink">
              {formatLocalCurrency(e.amountLocal, localCurrency)}
            </p>
            <p className="text-ink/60">
              ≈ {formatBaseCurrency(e.amountBase, baseCurrency)}
            </p>
            <button
              type="button"
              className="mt-1 text-[10px] text-vermillion/70"
              onClick={() => onRemove(e.id)}
            >
              刪除
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function iconForCategory(category: string) {
  if (category.includes('餐') || category.includes('飲')) return '🍣'
  if (category.includes('交')) return '🚗'
  if (category.includes('宿')) return '🏨'
  if (category.includes('購')) return '🛍️'
  if (category.includes('景')) return '🗼'
  return '💸'
}

