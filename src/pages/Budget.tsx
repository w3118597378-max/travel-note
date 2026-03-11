import { useEffect } from 'react'
import { SectionTitle } from '@/components/common/SectionTitle'
import { BudgetSummary } from '@/components/budget/BudgetSummary'
import { ExpensePieChart } from '@/components/budget/ExpensePieChart'
import { ExpenseForm } from '@/components/budget/ExpenseForm'
import { ExpenseList } from '@/components/budget/ExpenseList'
import { CurrencyConverter } from '@/components/budget/CurrencyConverter'
import { useBudget } from '@/hooks/useBudget'

export function Budget() {
  const { expenses, totalBase, syncFromFirestoreOnce, addExpense, removeExpense } = useBudget()

  useEffect(() => {
    void syncFromFirestoreOnce()
  }, [])

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>旅行记账</SectionTitle>
        <BudgetSummary expenses={expenses} totalBase={totalBase} />
      </section>

      <section>
        <div className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4 space-y-3">
          <p className="text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">支出分佈</p>
          <ExpensePieChart expenses={expenses} />
        </div>
      </section>

      <section>
        <div className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4 space-y-3">
          <p className="text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">支出明細</p>
          <ExpenseList expenses={expenses} onRemove={removeExpense} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4 space-y-3">
          <p className="text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">新增支出</p>
          <ExpenseForm onAdd={addExpense} />
        </div>
        <CurrencyConverter />
      </section>
    </div>
  )
}


