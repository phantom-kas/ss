import { ResetPassword } from '@/components/authentication/reset_password'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/password-reset')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetPassword/>
}
