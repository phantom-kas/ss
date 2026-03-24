import { createFileRoute } from '@tanstack/react-router'
import { SelectAccountRoute } from './select-account'

export const Route = createFileRoute('/_auth/send/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SelectAccountRoute/>
}
