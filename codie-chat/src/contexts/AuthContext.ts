import { createContext } from 'react'
import type { User } from '../types'

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  /** Currently authenticated user */
  user: User | null
  /** JWT token for API authentication */
  token: string | null
  /** Loading state during auth operations */
  loading: boolean
  /** Error message from last auth operation */
  error: string | null
  /** Login function */
  login: (email: string, password: string) => Promise<void>
  /** Logout function */
  logout: () => Promise<void>
  /** Register new user */
  register?: (email: string, password: string, name: string) => Promise<void>
  /** Refresh authentication token */
  refreshToken?: () => Promise<void>
}

/**
 * Authentication context for managing user state across the app
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
