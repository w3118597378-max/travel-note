interface SectionTitleProps {
  children: React.ReactNode
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-px w-6 bg-vermillion/70" />
      <h2 className="text-xs tracking-[0.12em] text-ink/70 uppercase">
        {children}
      </h2>
    </div>
  )
}

