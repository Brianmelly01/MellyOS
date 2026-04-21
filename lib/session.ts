import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated or session expired.
 */
export async function getCurrentUser(): Promise<Omit<User, 'passwordHash'> | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('melly-session')?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  const { passwordHash: _, ...user } = session.user
  return user
}

/**
 * Require authentication — throws redirect if not authenticated.
 * Use in Server Components / Route Handlers.
 */
export async function requireUser(): Promise<Omit<User, 'passwordHash'>> {
  const user = await getCurrentUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }
  return user!
}
