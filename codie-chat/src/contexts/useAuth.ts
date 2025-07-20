import { useContext } from 'react'
import { AuthContext, type AuthContextType } from './AuthContext'

/**
 * Custom hook to access authentication context
 * @throws {Error} If used outside of AuthProvider
 * @returns {AuthContextType} The authentication context with user, token, and auth methods
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { user, login, logout } = useAuth()
 *   
 *   if (!user) {
 *     return <LoginForm onSubmit={login} />
 *   }
 *   
 *   return <Dashboard user={user} onLogout={logout} />
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app with <AuthProvider> to use authentication.'
    )
  }
  
  return context
}
