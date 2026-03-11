import { useState } from 'react'
import { useTripStore } from '@/hooks/useTripStore'
import { formatBaseCurrency, formatLocalCurrency } from '@/lib/utils'

export function CurrencyConverter() {
  const [localInput, setLocalInput] = useState('')
  const activeTrip = useTripStore(s => s.getActiveTrip())
  const budgetConfig = activeTrip?.budget

  const rate = budgetConfig?.exchangeRate ?? 1
  const num = Number(String(localInput).replace(/[^\d]/g, '')) || 0
  const baseValue = Math.round(num * rate)

  const localCurrency = budgetConfig?.localCurrency || 'JPY'
  const baseCurrency = budgetConfig?.baseCurrency || 'TWD'

  return (
    <div className="rounded-[2rem] bg-card border border-border shadow-premium px-5 py-4 space-y-3">
      <p className="text-[11px] font-semibold text-ink/60 mb-2 uppercase tracking-wider">匯率換算</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          aria-label={`輸入${localCurrency}金額`}
          className="h-10 flex-1 rounded-2xl border border-border bg-paper px-4 text-[11px] outline-none focus:border-vermillion/50 focus:ring-1 focus:ring-vermillion/20"
          placeholder={`輸入金額，例如 10000`}
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
        />
        <span className="text-[11px] text-ink/60">{localCurrency}</span>
      </div>
      <p className="text-[11px] text-ink/60">
        約等於 <span className="font-semibold text-ink">{formatBaseCurrency(baseValue, baseCurrency)}</span>
        {num > 0 && (
          <span className="ml-1 text-ink/50">
            （{formatLocalCurrency(num, localCurrency)} × {rate}）
          </span>
        )}
      </p>
    </div>
  )
}
