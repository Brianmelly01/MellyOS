import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  url: z.string().url().optional(),
  description: z.string().max(300).optional(),
  isActive: z.boolean().optional(),
  regenerateKey: z.boolean().optional(),
})

// PATCH /api/sites/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await prisma.site.findFirst({ where: { id: id, userId: user.id } })
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  try {
    const body = await req.json()
    const { regenerateKey, ...updates } = updateSchema.parse(body)

    const updated = await prisma.site.update({
      where: { id: id },
      data: { ...updates, ...(regenerateKey ? { apiKey: generateApiKey() } : {}) },
    })
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/sites/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await prisma.site.findFirst({ where: { id: id, userId: user.id } })
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  await prisma.site.delete({ where: { id: id } })
  return NextResponse.json({ ok: true })
}
