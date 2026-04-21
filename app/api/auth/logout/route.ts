import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('melly-session')?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('melly-session')
  return response
}
