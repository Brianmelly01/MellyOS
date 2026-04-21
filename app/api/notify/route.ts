import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, apiError } from '@/lib/auth-api'
import { prisma } from '@/lib/prisma'
import { emitToUser } from '@/lib/socket'
import { z } from 'zod'

const notifySchema = z.object({
  type: z.enum(['ORDER', 'MESSAGE', 'DESIGN_REQUEST', 'CUSTOM']).default('CUSTOM'),
  title: z.string().min(1).max(200),
  body: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * POST /api/notify
 * External sites call this endpoint to push notifications into MellyOS.
 *
 * Headers:
 *   x-api-key: <site-api-key>
 *
 * Body: { type, title, body?, metadata? }
 */
export async function POST(req: NextRequest) {
  const site = await validateApiKey(req)
  if (!site) return apiError('Invalid or missing API key', 401)

  try {
    const body = await req.json()
    const data = notifySchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: data.metadata ?? undefined,
        siteId: site.id,
      },
      include: { site: { select: { name: true } } },
    })

    // Emit real-time event to the site owner
    emitToUser(site.userId, 'notification:new', notification)

    return NextResponse.json({ ok: true, id: notification.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.errors[0].message)
    console.error('[NOTIFY]', err)
    return apiError('Internal server error', 500)
  }
}
