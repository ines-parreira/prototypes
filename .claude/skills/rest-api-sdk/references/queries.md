# Queries Package Guide

Based on TanStack Query v4 (`@tanstack/react-query`).

## Read Queries

Generated for all `GET` and `HEAD` endpoints using `useQuery`.

**Naming**: `use + pascalCase(<OperationID>)`

```tsx
import { useGetTicket } from '@gorgias/helpdesk-queries'

const ticketId = 1
const { data, isLoading, error } = useGetTicket(ticketId)

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>

const ticket = data?.data
if (ticket) return <div>Ticket: {ticket.subject}</div>
```

## Query Options

All `useQuery` options except `queryFn` and `queryKey` (managed by SDK) can be passed via `query`:

```tsx
import { useGetTicket } from '@gorgias/helpdesk-queries'

const { data } = useGetTicket(ticketId, {
    query: {
        enabled: !!ticketId,
        staleTime: 1000 * 60 * 5,
    }
})
```

## Query Keys

Managed internally, exposed via `queryKeys` store for cache invalidation. Structured by API resource tags, named by `operationId`.

```tsx
import { queryKeys } from '@gorgias/helpdesk-queries'

// Structure example
queryKeys.tickets.all()                // => ['tickets']
queryKeys.tickets.listTickets()        // => ['tickets', 'listTickets']
queryKeys.tickets.listTickets({ customer_id: 1 })
    // => ['tickets', 'listTickets', { customer_id: 1 }]
queryKeys.tickets.getTicket(1)         // => ['tickets', 'getTicket', 1]
queryKeys.tickets.getTicket(1, { relationships: ['custom_fields'] })
    // => ['tickets', 'getTicket', 1, { relationships: ['custom_fields'] }]
```

**Important**: When invalidating for a single operation (not `all()`), use the same parameters as passed to the query hook.

### Cache Invalidation Example

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateTicket, queryKeys } from '@gorgias/helpdesk-queries'

const queryClient = useQueryClient()

const { mutate } = useUpdateTicket({
    mutation: {
        onSettled: () => {
            return queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() })
        },
    }
})

const handleSave = () => {
    mutate({ id: ticketId, data: { subject: 'New subject' } })
}
```

### Reading Query Status from Another Context

```tsx
import { useIsFetching } from '@tanstack/react-query'
import { queryKeys } from '@gorgias/helpdesk-queries'

const isFetchingTicket = useIsFetching({ queryKey: queryKeys.tickets.getTicket(1) })

if (isFetchingTicket) return <div>Loading ticket...</div>
```

## Mutations

Generated for `POST`, `PUT`, `PATCH`, `DELETE` endpoints using `useMutation`.

**Naming**: `use + <OperationID>`

```tsx
import { useCreateTicket } from '@gorgias/helpdesk-queries'

const { mutate } = useCreateTicket()

const handleSave = () => {
    mutate({
        data: {
            subject: 'Ticket subject',
            // ...
        },
    })
}
```

## Mutation Options

All `useMutation` options except `mutationFn` (managed by SDK) can be passed via `mutation`:

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { useCreateTicket, queryKeys } from '@gorgias/helpdesk-queries'

const queryClient = useQueryClient()

const { mutate } = useCreateTicket({
    mutation: {
        onSuccess: () => {
            console.log('Ticket created successfully!')
        },
        onError: (error) => {
            console.error('Failed to create ticket:', error)
        },
        onSettled: () => {
            return queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all() })
        },
        retry: true,
        retryDelay: 1000,
    }
})
```
