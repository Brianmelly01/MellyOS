'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Globe,
  Bell,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/sites',     icon: Globe,           label: 'Sites'     },
  { href: '/notifications', icon: Bell,        label: 'Notifications' },
  { href: '/settings',  icon: Settings,        label: 'Settings'  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col border-r border-border"
      style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <Image src="/logo.png" alt="MellyOS" width={36} height={36} className="rounded-lg" />
        <div>
          <span className="font-bold text-foreground text-lg leading-none">MellyOS</span>
          <p className="text-[10px] text-muted-foreground tracking-widest mt-0.5">YOUR WORLD. CONNECTED.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 pb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn('nav-link', isActive && 'active')}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border/50">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-brand-400/5 border border-brand-400/15">
          <Zap className="w-3.5 h-3.5 text-brand-400" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">System Online</p>
            <p className="text-[10px] text-muted-foreground">All services running</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-neon-green animate-pulse flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
