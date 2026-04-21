import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { z } from 'zod'

const createSiteSchema = z.object({
  name: z.string().min(1).max(80),
  url: z.string().url(),
  description: z.string().max(300).optional(),
})

// GET /api/sites — list user's sites
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    include: { _count: { select: { notifications: true, orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sites)
}

// POST /api/sites — create a new site
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, url, description } = createSiteSchema.parse(body)

    const site = await prisma.site.create({
      data: { name, url, description, apiKey: generateApiKey(), userId: user.id },
      include: { _count: { select: { notifications: true, orders: true } } },
    })

    return NextResponse.json(site, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[SITES POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
