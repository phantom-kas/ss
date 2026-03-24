import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/send/$recipientId/amount')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/send/$recipientId/amount"!</div>
}
