import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TotpPage } from '@/components/enterTotp'
import { useAuthStore, authActions } from '@/stores/auth'
import api from '@/lib/axios'
import { showError } from '@/lib/error'
import axios from 'axios'
import { toast } from 'sonner'
import { usePusherStore } from '@/stores/pusher'

export const Route = createFileRoute('/_auth/2fa-challenge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginTotpChallenge />
}

function LoginTotpChallenge() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const partialToken = useAuthStore((s) => s.partialToken)

  useEffect(() => {
    if (!partialToken) {
      navigate({ to: '/signin' })
    }
  }, [partialToken, navigate])

  const handleSubmit = async (code: string) => {
    setIsLoading(true)
    setError('')
    try {


      // const res = await axios.post(
      //   api.defaults.baseURL + '/api/2fa/verify-login',
      //   { code },
      //   { headers: { Authorization: `Bearer ${partialToken}` } }
      // )
fetch('http://localhost:3001/api/2fa/verify-login', {
  method: 'POST',
  credentials: 'include',
   headers: { Authorization: `Bearer ${partialToken}` }
})
      const { data, accessToken } = res.data

      authActions.setPartialToken(null)
      authActions.login(data, accessToken)

      if (!data.done_onboarding) {
        navigate({ to: '/onboarding' })
        return
      }
    usePusherStore.getState().connect(data.public_id, accessToken)

      navigate({ to: '/dashboard' })
      toast.success('Login success')
    } catch (err: any) {
      showError(err)
      setError(err?.response?.data?.message ?? 'Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TotpPage
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app to continue."
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      onCancel={() => {
        authActions.setPartialToken(null)
        navigate({ to: '/signin' })  // fixed: was '/login'
      }}
      cancelLabel="Back to login"
    />
  )
}
