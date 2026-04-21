import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { SitesClient } from '@/components/sites/SitesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sites' }

export default async function SitesPage() {
  const user = await requireUser()
  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { notifications: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <SitesClient initialSites={sites} />
}
