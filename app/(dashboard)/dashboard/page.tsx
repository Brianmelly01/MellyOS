import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentNotifications } from '@/components/dashboard/RecentNotifications'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { SiteActivity } from '@/components/dashboard/SiteActivity'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const user = await requireUser()

  const [sites, totalNotifications, unreadNotifications, totalOrders, recentNotifications, recentOrders] =
    await Promise.all([
      prisma.site.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where: { site: { userId: user.id } } }),
      prisma.notification.count({ where: { site: { userId: user.id }, isRead: false } }),
      prisma.order.count({ where: { site: { userId: user.id } } }),
      prisma.notification.findMany({
        where: { site: { userId: user.id } },
        include: { site: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.order.findMany({
        where: { site: { userId: user.id } },
        include: { site: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening across your connected sites.
        </p>
      </div>

      {/* Stats */}
      <StatsCards
        totalSites={sites.length}
        totalNotifications={totalNotifications}
        unreadNotifications={unreadNotifications}
        totalOrders={totalOrders}
      />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentOrders orders={recentOrders} />
        </div>
        <div className="space-y-6">
          <RecentNotifications notifications={recentNotifications} />
          <SiteActivity sites={sites} />
        </div>
      </div>
    </div>
  )
}
