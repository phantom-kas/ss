import { SplashWrapper } from '@/components/google-success'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/google-success')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SplashWrapper/>}
