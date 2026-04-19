/**
 * stores/pusher.ts
 *
 * Manages a single Pusher connection per session.
 * - Connect/subscribe after login with the user's public_id
 * - Private channel: `private-user-{publicId}` (Pusher signs it server-side)
 * - Any component can bind to events via usePusherEvent() hook
 * - Polling remains as fallback — Pusher events just resolve things faster
 *
 * Install:
 *   npm install pusher-js
 *
 * Env vars needed on the frontend:
 *   VITE_PUSHER_KEY=your_app_key
 *   VITE_PUSHER_CLUSTER=eu   (or mt1, ap2, etc)
 */

import Pusher, { Channel } from 'pusher-js'
import { create } from 'zustand'
import api from '@/lib/axios'
// ── Types ──────────────────────────────────────────────────────────────────

type EventCallback = (data: any) => void

interface PusherState {
  pusher:    Pusher | null
  channel:   Channel | null
  connected: boolean

  /** Connect and subscribe to the user's private channel */
  connect: (publicId: string, authToken: string) => void

  /** Disconnect and clean up (call on logout) */
  disconnect: () => void

  /** Bind an event listener on the active channel */
  bind: (event: string, callback: EventCallback) => void

  /** Unbind an event listener */
  unbind: (event: string, callback: EventCallback) => void
}

// ── Store ──────────────────────────────────────────────────────────────────

export const usePusherStore = create<PusherState>((set, get) => ({
  pusher:    null,
  channel:   null,
  connected: false,

  connect(publicId: string, authToken: string) {
    // Don't reconnect if already on this channel
    const existing = get()
    if (existing.pusher && existing.connected) return

    const pusher = new Pusher('ac77fc9658ba8d620f08' as string, {
      cluster: 'eu'as string,

      // Private channel auth — sends POST to your backend with socket_id + channel_name.
      // Your backend calls pusher.authorizeChannel() and returns the signed token.
      // The Authorization header carries the user's JWT so your backend knows who they are.
      channelAuthorization: {
        transport: 'ajax',
        endpoint:  `${api.defaults.baseURL}/pusher/auth`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    })

    // `private-user-{publicId}` — Pusher enforces server-side auth before allowing subscribe
    const channelName = `private-user-${publicId}`
    const channel     = pusher.subscribe(channelName)

    pusher.connection.bind('connected',    () => set({ connected: true  }))
    pusher.connection.bind('disconnected', () => set({ connected: false }))
    pusher.connection.bind('error',        (err: any) => {
      console.error('[Pusher] connection error', err)
    })

    channel.bind('pusher:subscription_error', (err: any) => {
      console.error('[Pusher] subscription_error', err)
    })

    set({ pusher, channel })
  },

  disconnect() {
    const { pusher } = get()
    if (pusher) {
      pusher.disconnect()
    }
    set({ pusher: null, channel: null, connected: false })
  },

  bind(event: string, callback: EventCallback) {
    get().channel?.bind(event, callback)
  },

  unbind(event: string, callback: EventCallback) {
    get().channel?.unbind(event, callback)
  },
}))

// ── Hook: bind a Pusher event in any component ────────────────────────────
//
// Usage:
//   usePusherEvent('transfer.updated', (data) => {
//     console.log('Transfer updated', data)
//   })
//
// The callback is stable — wrapped in useEffect with cleanup.

import { useEffect, useRef } from 'react'

export function usePusherEvent(event: string, callback: EventCallback) {
  const { bind, unbind } = usePusherStore()

  // Keep callback ref stable so we don't rebind on every render
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const handler = (data: any) => cbRef.current(data)
    bind(event, handler)
    return () => unbind(event, handler)
  }, [event, bind, unbind])
}