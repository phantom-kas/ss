import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/send/$recipientId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet/>
}
