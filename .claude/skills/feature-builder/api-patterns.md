# API Integration Patterns

## SDK Packages

Use these packages for all HTTP operations. Each service has a consistent structure: `-client`, `-queries`, `-types`, `-validators`, and `-mocks`.

| Service | Queries Package | Types Package | Mocks Package |
|---------|-----------------|---------------|---------------|
| Helpdesk (most common) | `@gorgias/helpdesk-queries` | `@gorgias/helpdesk-types` | `@gorgias/helpdesk-mocks` |
| Knowledge Service | `@gorgias/knowledge-service-queries` | `@gorgias/knowledge-service-types` | `@gorgias/knowledge-service-mocks` |
| Help Center | `@gorgias/help-center-queries` | `@gorgias/help-center-types` | `@gorgias/help-center-mocks` |
| Convert | `@gorgias/convert-queries` | `@gorgias/convert-types` | `@gorgias/convert-mocks` |
| Ecommerce Storage | `@gorgias/ecommerce-storage-queries` | N/A | `@gorgias/ecommerce-storage-mocks` |

## Basic Query Hook Usage

```tsx
import { Banner, Skeleton } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'

function TicketDetails({ ticketId }: { ticketId: number }) {
    const { data: ticket, isLoading, isError, error } = useGetTicket(ticketId)

    if (isLoading) return <Skeleton />
    if (isError) return <Banner variant="error">{error.message}</Banner>

    return <div>{ticket.subject}</div>
}
```

## Creating Application-Level Query Hooks

Wrap SDK hooks to add caching configuration:

```tsx
// queries/useGetTicket.ts
import { useGetTicket as useGetTicketPrimitive } from '@gorgias/helpdesk-queries'

export function useGetTicket(ticketId: number) {
    return useGetTicketPrimitive(ticketId, {
        query: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        },
    })
}
```

## Creating Application-Level Mutation Hooks

Handle cache management and optimistic updates:

```tsx
// queries/useDeleteTicket.ts
import { useQueryClient } from '@tanstack/react-query'
import {
    queryKeys,
    useDeleteTicket as useDeleteTicketPrimitive,
} from '@gorgias/helpdesk-queries'

export function useDeleteTicket() {
    const queryClient = useQueryClient()

    return useDeleteTicketPrimitive({
        mutation: {
            onMutate: async (params) => {
                // Cancel in-flight queries
                await queryClient.cancelQueries({
                    queryKey: queryKeys.tickets.listTickets(),
                })

                // Snapshot previous data
                const previousTickets = queryClient.getQueryData(
                    queryKeys.tickets.listTickets()
                )

                // Optimistically remove the ticket
                queryClient.setQueriesData(
                    { queryKey: queryKeys.tickets.listTickets() },
                    (old: any) => old?.filter((t: any) => t.id !== params.id)
                )

                return { previousTickets }
            },
            onError: (_error, _params, context) => {
                // Rollback on error
                if (context?.previousTickets) {
                    queryClient.setQueryData(
                        queryKeys.tickets.listTickets(),
                        context.previousTickets
                    )
                }
            },
            onSettled: () => {
                // Refetch to ensure consistency
                queryClient.invalidateQueries({
                    queryKey: queryKeys.tickets.listTickets(),
                })
            },
        },
    })
}
```

## Using Mutations in Components

Keep UI concerns (toasts, navigation) in components:

```tsx
import { useAppDispatch } from 'store/hooks'
import { notify, NotificationStatus } from 'store/notifications'
import { useDeleteTicket } from '../queries/useDeleteTicket'

function DeleteButton({ ticketId }: { ticketId: number }) {
    const dispatch = useAppDispatch()
    const { mutateAsync: deleteTicket, isPending } = useDeleteTicket()

    async function handleDelete() {
        try {
            await deleteTicket({ id: ticketId })
            dispatch(notify({
                message: 'Ticket deleted',
                status: NotificationStatus.Success,
            }))
        } catch (error) {
            dispatch(notify({
                message: 'Failed to delete ticket',
                status: NotificationStatus.Error,
            }))
        }
    }

    return (
        <Button onClick={handleDelete} loading={isPending}>
            Delete
        </Button>
    )
}
```

## Query Keys

Use the SDK's `queryKeys` for cache operations:

```tsx
import { queryKeys } from '@gorgias/helpdesk-queries'

// Single entity
queryKeys.tickets.getTicket(123)

// List query
queryKeys.tickets.listTickets()

// Invalidate all ticket queries
queryClient.invalidateQueries({
    queryKey: queryKeys.tickets.all(),
})
```

## Anti-patterns

### Never use direct API calls

```tsx
// ❌ WRONG
const response = await fetch('/api/tickets')
const ticket = await api.get(`/tickets/${id}`)

// ✅ CORRECT
const { data: tickets } = useListTickets()
```

### Never use Redux for server state

```tsx
// ❌ WRONG
const fetchTicket = createAsyncThunk('tickets/fetchTicket', ...)

// ✅ CORRECT
const { data: ticket } = useGetTicket(ticketId)
```

### Never mix UI concerns in data hooks

```tsx
// ❌ WRONG - UI concerns in hook
export function useDeleteTicket() {
    const dispatch = useAppDispatch()
    return useDeleteTicketPrimitive({
        mutation: {
            onSuccess: () => {
                dispatch(notify({ message: 'Done!' })) // ❌ UI concern
            },
        },
    })
}

// ✅ CORRECT - UI concerns in component
// Hook handles only cache, component handles notifications
```
