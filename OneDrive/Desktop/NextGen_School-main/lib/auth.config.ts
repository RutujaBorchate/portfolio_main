import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from './types'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
        token.isApproved = user.isApproved as boolean
        token.institutionId = user.institutionId as string
        token.class = user.class as number
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.isApproved = token.isApproved as boolean
        session.user.institutionId = token.institutionId as string
        session.user.class = token.class as number
      }
      return session
    },
  },
  providers: [], // Empty array to satisfy satisfy NextAuthConfig, will be populated in auth.ts
} satisfies NextAuthConfig
