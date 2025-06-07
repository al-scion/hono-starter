import posthog from 'posthog-js'

// Initialize PostHog only on the client side
if (typeof window !== 'undefined') {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY || '', {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.debug() // debug mode in development
    },
  })
}

export { posthog } 