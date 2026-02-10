import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { Toaster } from '@/components/ui/sonner'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AppToaster />
    </>
  )
}

function AppToaster() {
  return (
    <Toaster
      richColors
      toastOptions={{
        closeButton: true,
        classNames: {
          toast: 'rounded-2xl shadow-md px-4 py-2 text-sm',
          title: 'font-bold text-base',
          description: 'text-sm text-muted-foreground',
        },
      }}
    />
  )
}
