

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { TotpPage } from '@/components/enterTotp'
import { useAuthStore, authActions } from '@/stores/auth'
import api from '@/lib/axios'
import { showError } from '@/lib/error'
import axios from 'axios'
import { toast } from 'sonner'

export const Route = createFileRoute('/2fa-challenge-signin')({
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

  // Guard — if no partial token they shouldn't be here
  // if (!partialToken) {
  //   navigate({ to: '/signin' })
  //   return null
  // }

  const handleSubmit = async (code: string) => {
  setIsLoading(true)
  setError('')
  try {
    const res = await axios.post(
      api.defaults.baseURL + '/api/2fa/verify-login',
      { code },
      { headers: { Authorization: `Bearer ${partialToken}` } }
    )

    const { data, accessToken } = res.data

    authActions.setPartialToken(null)
    authActions.login(data, accessToken)
    console.log('datadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadata')
    console.log(data)
    console.log('datadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadata')

    if (!data.done_onboarding) {
      navigate({ to: '/onboarding' })
      return
    }

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
        navigate({ to: '/signin' })
      }}
      cancelLabel="Back to login"
    />
  )
}