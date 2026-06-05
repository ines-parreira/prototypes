# Client Package Guide

## Request Handlers

The SDK provides handlers for each API operation from the OpenAPI spec. These are also the building blocks for query hooks in the `queries` package.

**Naming**: `camelCase(<OperationID>)`

```tsx
import { getTicket, Ticket } from '@gorgias/helpdesk-client'

const ticketId = 1

try {
    const response = await getTicket(ticketId)
    const ticket = response.data // ticket is of type Ticket
    console.log(`Ticket subject: ${ticket.subject}`)
} catch (e) {
    console.log('Error:', e)
}
```

## HTTP Options

All handlers accept an optional `options` parameter for HTTP request configuration:

```tsx
import { getTicket } from '@gorgias/helpdesk-client'

const response = await getTicket(ticketId, {
    headers: {
        'X-Custom-Header': 'custom-value'
    }
})
```

## Client Configuration

Set client-wide defaults with `setDefaultConfig()`. Applied to all request handlers and query hooks.

```tsx
import { setDefaultConfig } from '@gorgias/helpdesk-client'

setDefaultConfig({
    baseURL: 'https://api.gorgias.com',
    headers: {
        'X-Custom-Header': 'custom-value'
    },
})
```

## Interceptors

Request and response interceptors for authentication, logging, or other client-wide dynamic logic.

```tsx
import { useRequestInterceptor } from '@gorgias/helpdesk-client'

export const buildAuthInterceptor = () => {
    const authService = new GorgiasAppAuthService()

    return async (config) => {
        const accessToken = await authService.getAccessToken()
        config.headers.authorization = `Bearer ${accessToken}`
        return config
    }
}

const authInterceptor = buildAuthInterceptor()
useRequestInterceptor(authInterceptor)
```
