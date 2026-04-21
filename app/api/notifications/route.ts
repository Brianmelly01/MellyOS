import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/notifications
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId')
  const type = searchParams.get('type')
  const unreadOnly = searchParams.get('unread') === 'true'

  const notifications = await prisma.notification.findMany({
    where: {
      site: { userId: user.id },
      ...(siteId ? { siteId } : {}),
      ...(type ? { type: type as 'ORDER' | 'MESSAGE' | 'DESIGN_REQUEST' | 'CUSTOM' } : {}),
      ...(unreadOnly ? { isRead: false } : {}),
    },
    include: { site: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(notifications)
}

// POST /api/notifications/mark-all-read
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { site: { userId: user.id }, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
