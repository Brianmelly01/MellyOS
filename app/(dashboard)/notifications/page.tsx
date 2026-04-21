import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const user = await requireUser()
  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const notifications = await prisma.notification.findMany({
    where: { site: { userId: user.id } },
    include: { site: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return <NotificationsClient initialNotifications={notifications} sites={sites} userId={user.id} />
}
