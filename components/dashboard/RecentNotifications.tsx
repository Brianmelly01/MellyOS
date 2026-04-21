import Link from 'next/link'
import { Bell, ShoppingBag, MessageSquare, Palette, Zap, ArrowRight } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

const typeConfig = {
  ORDER:          { icon: ShoppingBag, color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Order'   },
  MESSAGE:        { icon: MessageSquare, color: '#4d79ff', bg: 'rgba(77,121,255,0.1)', label: 'Message' },
  DESIGN_REQUEST: { icon: Palette, color: '#a855f7', bg: 'rgba(168,85,247,0.1)',      label: 'Design'  },
  CUSTOM:         { icon: Zap,    color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',        label: 'Custom'  },
}

interface Props {
  notifications: Array<{
    id: string
    type: string
    title: string
    isRead: boolean
    createdAt: Date
    site: { name: string }
  }>
}

export function RecentNotifications({ notifications }: Props) {
  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent Notifications</h2>
        </div>
        <Link href="/notifications" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/30">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : notifications.map((n) => {
          const cfg = typeConfig[n.type as keyof typeof typeConfig] || typeConfig.CUSTOM
          return (
            <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-accent/40 transition-colors ${!n.isRead ? 'bg-brand-400/[0.03]' : ''}`}>
              {!n.isRead && <span className="w-1 h-1 rounded-full bg-brand-400 mt-2 flex-shrink-0 animate-pulse" />}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bg }}>
                <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: cfg.color }}>{n.site.name}</p>
                <p className="text-sm text-foreground leading-snug truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(n.createdAt)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
