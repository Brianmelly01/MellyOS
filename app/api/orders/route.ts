import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, apiError } from '@/lib/auth-api'
import { prisma } from '@/lib/prisma'
import { emitToUser } from '@/lib/socket'
import { getCurrentUser } from '@/lib/session'
import { z } from 'zod'

const orderSchema = z.object({
  externalId: z.string().optional(),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).default('PENDING'),
  metadata: z.record(z.unknown()).optional(),
})

// POST /api/orders — external sites push orders
export async function POST(req: NextRequest) {
  const site = await validateApiKey(req)
  if (!site) return apiError('Invalid or missing API key', 401)

  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    const order = await prisma.order.create({
      data: { ...data, metadata: data.metadata ?? undefined, siteId: site.id },
      include: { site: { select: { name: true } } },
    })

    // Also create a notification for new order
    const notification = await prisma.notification.create({
      data: {
        type: 'ORDER',
        title: `New order from ${data.customerName}`,
        body: `${data.currency} ${(data.amount / 100).toFixed(2)} — ${data.status}`,
        siteId: site.id,
        metadata: { orderId: order.id },
      },
      include: { site: { select: { name: true } } },
    })

    emitToUser(site.userId, 'notification:new', notification)
    emitToUser(site.userId, 'order:new', order)

    return NextResponse.json({ ok: true, id: order.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message)
    console.error('[ORDERS POST]', err)
    return apiError('Internal server error', 500)
  }
}

// GET /api/orders — internal, session-authenticated
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId')

  const orders = await prisma.order.findMany({
    where: { site: { userId: user.id }, ...(siteId ? { siteId } : {}) },
    include: { site: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(orders)
}
