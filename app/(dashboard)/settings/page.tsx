import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { SettingsClient } from '@/components/settings/SettingsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const user = await requireUser()
  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return <SettingsClient user={user} sites={sites} />
}
