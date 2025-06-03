import { hc } from 'hono/client'
import type { AppType } from '../../server'

export const api = hc<AppType>('', {
  init: {
    credentials: 'include',
  },
})

// client.api.hello.$get({query: {name: "John"}})