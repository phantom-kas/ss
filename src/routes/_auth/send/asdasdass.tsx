import { createFileRoute } from '@tanstack/react-router'
import { SelectAccountRoute } from './select-account'
// import { SendRoute } from './select-account'

export const Route = createFileRoute('/_auth/send/asdasdass')({
  component: SelectAccountRoute,
})

