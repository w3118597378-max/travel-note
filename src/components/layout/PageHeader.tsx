import { CalendarDays } from 'lucide-react'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  rightExtra?: React.ReactNode
}

export function PageHeader({ title, subtitle, rightExtra }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-paper/70 glass px-5 pt-safe pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Custom App Logo */}
          <div className="h-9 w-9 rounded-full bg-vermillion flex items-center justify-center shadow-sm flex-shrink-0">
            <svg viewBox="0 0 100 100" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
              {/* Dotted route path */}
              <path
                d="M 18 72 Q 28 38 55 44 Q 74 50 74 30"
                stroke="white"
                strokeWidth="9"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="10 13"
                opacity="0.9"
              />
              {/* Location pin circle */}
              <circle cx="74" cy="26" r="16" fill="white" />
              <circle cx="74" cy="26" r="7" fill="#C0392B" />
              {/* Start dot */}
              <circle cx="18" cy="72" r="9" fill="white" opacity="0.85" />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-medium text-ink/40 tracking-widest uppercase mb-0.5">漫途</span>
            <h1 className="text-[15px] font-display text-ink leading-none tracking-tight">
              {title ?? '我的旅行'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightExtra}
          <button
            type="button"
            aria-label="行程日历"
            className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center text-ink/80 shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-ink/60">
          {subtitle}
        </p>
      )}
    </header>
  )
}

