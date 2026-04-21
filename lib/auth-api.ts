import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Validates the x-api-key header and returns the associated site.
 * Returns null if invalid.
 */
export async function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) return null

  const site = await prisma.site.findUnique({
    where: { apiKey },
    include: { user: true },
  })

  if (!site || !site.isActive) return null
  return site
}

/**
 * Standard error response helper
 */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
