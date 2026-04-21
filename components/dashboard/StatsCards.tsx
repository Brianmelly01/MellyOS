import { Globe, Bell, ShoppingBag, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  totalSites: number
  totalNotifications: number
  unreadNotifications: number
  totalOrders: number
}

export function StatsCards({ totalSites, totalNotifications, unreadNotifications, totalOrders }: StatsCardsProps) {
  const cards = [
    {
      id: 'stat-sites',
      label: 'Connected Sites',
      value: totalSites,
      icon: Globe,
      color: '#4d79ff',
      bg: 'rgba(77,121,255,0.1)',
      border: 'rgba(77,121,255,0.2)',
      sub: `${totalSites === 0 ? 'Add your first site' : `${totalSites} active`}`,
    },
    {
      id: 'stat-notifications',
      label: 'Notifications',
      value: totalNotifications,
      icon: Bell,
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.1)',
      border: 'rgba(168,85,247,0.2)',
      sub: `${unreadNotifications} unread`,
    },
    {
      id: 'stat-orders',
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: '#22d3ee',
      bg: 'rgba(34,211,238,0.1)',
      border: 'rgba(34,211,238,0.2)',
      sub: 'Across all sites',
    },
    {
      id: 'stat-activity',
      label: 'System Status',
      value: '100%',
      icon: TrendingUp,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.2)',
      sub: 'All systems operational',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.id}
          id={card.id}
          className="stat-card"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}>
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: card.bg, color: card.color }}>
              Live
            </span>
          </div>

          {/* Value */}
          <div className="mb-1">
            <span className="text-3xl font-bold text-foreground">{card.value}</span>
          </div>

          {/* Labels */}
          <p className="text-sm font-medium text-foreground">{card.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
