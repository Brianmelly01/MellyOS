import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// PATCH /api/notifications/[id] — mark as read/unread
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await prisma.notification.findFirst({
    where: { id: params.id, site: { userId: user.id } },
  })
  if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { isRead: body.isRead ?? true },
  })
  return NextResponse.json(updated)
}

// DELETE /api/notifications/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await prisma.notification.findFirst({
    where: { id: params.id, site: { userId: user.id } },
  })
  if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.notification.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
