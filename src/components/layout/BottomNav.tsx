import { Link } from 'react-router-dom'
import { Home as HomeIcon, Map, Info as InfoIcon, Wallet } from 'lucide-react'

interface BottomNavProps {
  pathname: string
}

const items = [
  { id: 'nav-home', to: '/', label: '首页', icon: HomeIcon },
  { id: 'nav-itinerary', to: '/day/1', label: '行程', icon: Map },
  { id: 'nav-info', to: '/info', label: '资讯', icon: InfoIcon },
  { id: 'nav-budget', to: '/budget', label: '记账', icon: Wallet }
]

export function BottomNav({ pathname }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom px-5 pb-2">
      <div className="mx-auto flex w-full max-w-[400px] items-center justify-between glass rounded-[2rem] px-4 py-2 shadow-premium">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.to || (item.to.startsWith('/day') && pathname.startsWith('/day'))

          return (
            <Link
              key={item.to}
              id={item.id}
              to={item.to}
              aria-label={item.label}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px]"
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                <Icon
                  className={`h-4 w-4 ${active ? 'text-vermillion' : 'text-ink/40'}`}
                />
                {active && (
                  <span className="absolute -top-1 h-1 w-1 rounded-full bg-vermillion" />
                )}
              </div>
              <span className={active ? 'text-vermillion font-medium' : 'text-ink/50'}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

