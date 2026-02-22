import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useAuth() {
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: api.auth.me,
  })

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: api.auth.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], { user: null })
    },
  })

  return {
    user: data?.user || null,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isAuthenticated: !!data?.user,
  }
}
