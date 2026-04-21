'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface HeaderProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface NotifPreview {
  id: string
  title: string
  isRead: boolean
  createdAt: string
  site: { name: string }
  type: string
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState<NotifPreview[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/notifications?unread=false')
      .then(r => r.json())
      .then((data: NotifPreview[]) => {
        if (Array.isArray(data)) {
          setNotifs(data.slice(0, 5))
          setUnreadCount(data.filter(n => !n.isRead).length)
        }
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const typeColors: Record<string, string> = {
    ORDER: 'text-neon-green',
    MESSAGE: 'text-neon-blue',
    DESIGN_REQUEST: 'text-neon-purple',
    CUSTOM: 'text-muted-foreground',
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 z-10">
      {/* Left: breadcrumb placeholder / greeting */}
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notif-bell"
            onClick={() => { setShowNotifs(v => !v); setShowUserMenu(false) }}
            className="relative p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                style={{ background: 'linear-gradient(135deg,#4d79ff,#a855f7)' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 glass border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  <Link href="/notifications" className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    onClick={() => setShowNotifs(false)}>View all</Link>
                </div>
                <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
                  ) : notifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-accent/50 transition-colors ${!n.isRead ? 'bg-brand-400/5' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${typeColors[n.type] || 'text-muted-foreground'}`}>{n.site.name}</p>
                          <p className="text-sm text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            id="user-menu-btn"
            onClick={() => { setShowUserMenu(v => !v); setShowNotifs(false) }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#4d79ff,#a855f7)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{user.name.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-52 glass border border-border rounded-2xl shadow-2xl z-50 overflow-hidden py-1"
              >
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Link href="/settings" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <Link href="/settings" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <div className="border-t border-border/50 mt-1">
                  <button onClick={handleLogout} id="logout-btn"
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside close */}
      {(showNotifs || showUserMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowUserMenu(false) }} />
      )}
    </header>
  )
}
