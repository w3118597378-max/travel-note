import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { Expense } from '@/hooks/useBudget'

const CATEGORY_COLORS: Record<string, string> = {
  交通: '#3b82f6',
  住宿: '#C0392B',
  餐飲: '#f97316',
  景點門票: '#5C7A5C',
  購物: '#a855f7',
  雜費: '#6b7280'
}

interface ExpensePieChartProps {
  expenses: Expense[]
}

export function ExpensePieChart({ expenses }: ExpensePieChartProps) {
  const data = useMemo(() => {
    const byCat: Record<string, number> = {}
    expenses.forEach((e) => {
      byCat[e.category] = (byCat[e.category] ?? 0) + e.amountBase
    })
    return Object.entries(byCat).map(([name, value]) => ({
      name,
      value: Math.round(value),
      fill: CATEGORY_COLORS[name] ?? '#94a3b8'
    }))
  }, [expenses])

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[2rem] bg-card border border-border shadow-premium text-[11px] text-ink/50">
        尚無支出，新增後會顯示分佈
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] bg-card border border-border shadow-premium p-4">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), '']}
              contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
              formatter={(name) => <span className="text-ink/80">{name}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
