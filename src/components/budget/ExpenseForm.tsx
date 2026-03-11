import { useState } from 'react'
import { useTripStore } from '@/hooks/useTripStore'
import type { Expense } from '@/hooks/useBudget'

interface ExpenseFormProps {
  onAdd: (input: Omit<Expense, 'id' | 'createdAt' | 'tripId'>) => Promise<void>
}

export function ExpenseForm({ onAdd }: ExpenseFormProps) {
  const activeTrip = useTripStore(s => s.getActiveTrip())
  const budgetConfig = activeTrip?.budget

  const [amountInput, setAmountInput] = useState('')
  const [category, setCategory] = useState(budgetConfig?.categories[0] ?? '其他')
  const [note, setNote] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [day, setDay] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const numLocal = Number(amountInput.replace(/[^\d]/g, '')) || 0
  const amountBase = Math.round(numLocal * (budgetConfig?.exchangeRate ?? 1))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!numLocal || submitting) return
    setSubmitting(true)
    try {
      await onAdd({
        amountLocal: numLocal,
        amountBase,
        category,
        note,
        date,
        day
      })
      setAmountInput('')
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-2xl border border-border bg-paper px-4 text-[11px] outline-none focus:border-vermillion/50 focus:ring-1 focus:ring-vermillion/20"
          placeholder={`输入金额 (${budgetConfig?.localCurrency})`}
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
        />
        <span className="text-[11px] font-medium text-ink/60 self-center uppercase">{budgetConfig?.localCurrency}</span>
      </div>
      <div className="flex gap-2 text-[11px]">
        <select
          className="h-10 flex-1 rounded-2xl border border-border bg-paper px-4 outline-none focus:border-vermillion/50"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {budgetConfig?.categories.map((c: string) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="h-10 w-24 rounded-2xl border border-border bg-paper px-3 text-[11px] outline-none focus:border-vermillion/50"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          {activeTrip?.days.map((d: any) => (
            <option key={d.dayNumber} value={d.dayNumber}>
              Day {d.dayNumber}
            </option>
          ))}
        </select>
      </div>
      <input
        className="h-10 w-full rounded-2xl border border-border bg-paper px-4 text-[11px] outline-none focus:border-vermillion/50"
        placeholder="備註（選填）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex items-center justify-between px-1 text-[11px] text-ink/60">
        <span className="font-medium lowercase">
          约 {budgetConfig?.baseCurrency} {amountBase.toLocaleString()} · {budgetConfig?.localCurrency} {numLocal.toLocaleString()}
        </span>
        <input
          type="date"
          className="h-8 rounded-xl border border-border bg-paper px-2 text-[10px] outline-none"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !numLocal}
        className="w-full rounded-[1.5rem] bg-vermillion text-white shadow-premium py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        ＋ 新增支出
      </button>
    </form>
  )
}

