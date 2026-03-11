import { formatBaseCurrency } from '@/lib/utils'
import type { Expense } from '@/hooks/useBudget'
import { useTripStore } from '@/hooks/useTripStore'

interface BudgetSummaryProps {
  expenses: Expense[]
  totalBase: number
}

export function BudgetSummary({ expenses, totalBase }: BudgetSummaryProps) {
  const activeTrip = useTripStore(s => s.getActiveTrip())
  const totalBudget = activeTrip?.budget?.totalBudget ?? 0
  const used = totalBase
  const remaining = Math.max(totalBudget - used, 0)
  const ratio = totalBudget > 0 ? Math.min(used / totalBudget, 1) : 0
  const baseCurrency = activeTrip?.budget.baseCurrency || 'TWD'

  return (
    <section>
      <div className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-ink/60">总预算</p>
            <p className="font-display text-2xl text-ink leading-none mt-1">
              {formatBaseCurrency(used, baseCurrency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-ink/60">已使用</p>
            <p className="text-sm font-medium text-vermillion">
              {formatBaseCurrency(totalBudget, baseCurrency)}
            </p>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-border/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-vermillion"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-ink/60">
          <span>剩餘 {formatBaseCurrency(remaining, baseCurrency)}</span>
          <span>
            记录 {expenses.length} 笔
          </span>
        </div>
      </div>
    </section>
  )
}

