'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShoppingBag, MessageSquare, Palette, Zap, Check, CheckCheck, Trash2, Filter, X } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useSocket } from '@/hooks/useSocket'
import { useToast } from '@/hooks/use-toast'

const typeConfig = {
  ORDER:          { icon: ShoppingBag,   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Order'          },
  MESSAGE:        { icon: MessageSquare, color: '#4d79ff', bg: 'rgba(77,121,255,0.1)',  label: 'Message'        },
  DESIGN_REQUEST: { icon: Palette,       color: '#a855f7', bg: 'rgba(168,85,247,0.1)', label: 'Design Request' },
  CUSTOM:         { icon: Zap,           color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', label: 'Custom'         },
}

type NotifType = 'ORDER' | 'MESSAGE' | 'DESIGN_REQUEST' | 'CUSTOM'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string | null
  isRead: boolean
  createdAt: string
  site: { id: string; name: string }
}

interface Site { id: string; name: string }

interface Props {
  initialNotifications: Notification[]
  sites: Site[]
  userId: string
}

export function NotificationsClient({ initialNotifications, sites, userId }: Props) {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filterSite, setFilterSite] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRead, setFilterRead] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Real-time via Socket.io
  const socket = useSocket(userId)

  useEffect(() => {
    if (!socket) return
    socket.on('notification:new', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev])
      toast({ title: `📬 ${notif.site?.name || 'New notification'}`, description: notif.title })
    })
    return () => { socket.off('notification:new') }
  }, [socket, toast])

  const filtered = notifications.filter(n => {
    if (filterSite !== 'all' && n.site.id !== filterSite) return false
    if (filterType !== 'all' && n.type !== filterType) return false
    if (filterRead === 'unread' && n.isRead) return false
    if (filterRead === 'read' && !n.isRead) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function markRead(id: string) {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    })
    if (res.ok) setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  async function markAllRead() {
    const res = await fetch('/api/notifications', { method: 'POST' })
    if (res.ok) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast({ title: 'All notifications marked as read' })
    }
  }

  async function deleteNotif(id: string) {
    const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    if (res.ok) setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const activeFilters = [filterSite !== 'all', filterType !== 'all', filterRead !== 'all'].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg,#4d79ff,#a855f7)' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time updates from all your connected sites.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(v => !v)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <Filter className="w-4 h-4" /> Filters
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: '#4d79ff' }}>{activeFilters}</span>
            )}
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass border border-border rounded-2xl p-4 overflow-hidden">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Site</label>
                <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
                  className="bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-400/60 transition-all">
                  <option value="all">All sites</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-400/60 transition-all">
                  <option value="all">All types</option>
                  {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select value={filterRead} onChange={e => setFilterRead(e.target.value)}
                  className="bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-400/60 transition-all">
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              {activeFilters > 0 && (
                <button onClick={() => { setFilterSite('all'); setFilterType('all'); setFilterRead('all') }}
                  className="self-end flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeFilters > 0 ? 'Try adjusting your filters' : 'Notifications from your sites will appear here in real-time'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.CUSTOM
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: i < 10 ? i * 0.03 : 0 }}
                  className={`flex items-start gap-4 px-6 py-4 border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors group ${!n.isRead ? 'bg-brand-400/[0.03]' : ''}`}>
                  {/* Unread dot */}
                  <div className="flex-shrink-0 w-2 flex justify-center pt-2.5">
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />}
                  </div>

                  {/* Type icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: cfg.bg }}>
                    <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{n.site.name}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-0.5">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!n.isRead && (
                      <button onClick={() => markRead(n.id)} title="Mark as read"
                        className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-neon-green">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} title="Delete"
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
