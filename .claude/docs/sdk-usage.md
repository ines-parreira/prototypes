# SDK Usage

All HTTP operations use the REST API SDK packages built on `@tanstack/react-query`.

## Available Packages

Each service has a consistent package structure: `-client`, `-queries`, `-types`, `-validators`, and `-mocks`.

### Helpdesk API (most common)

```typescript
import { useGetTicket, useUpdateTicket } from '@gorgias/helpdesk-queries'
import { Ticket } from '@gorgias/helpdesk-types'
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'
```

### Knowledge Service API

```typescript
import { useGetArticle } from '@gorgias/knowledge-service-queries'
import { Article } from '@gorgias/knowledge-service-types'
import { mockGetArticleHandler } from '@gorgias/knowledge-service-mocks'
```

### Help Center API

```typescript
import { useGetHelpCenterArticle } from '@gorgias/help-center-queries'
import { HelpCenterArticle } from '@gorgias/help-center-types'
import { mockGetHelpCenterArticleHandler } from '@gorgias/help-center-mocks'
```

### Convert API

```typescript
import { useGetConversion } from '@gorgias/convert-queries'
import { Conversion } from '@gorgias/convert-types'
import { mockGetConversionHandler } from '@gorgias/convert-mocks'
```

### Ecommerce Storage API

```typescript
import { useGetEcommerceData } from '@gorgias/ecommerce-storage-queries'
import { mockGetEcommerceDataHandler } from '@gorgias/ecommerce-storage-mocks'
```

## Basic Data Fetching

```tsx
import { Banner, Box, Heading, Skeleton, Text } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'

function TicketDetails({ ticketId }: { ticketId: number }) {
    const { data: ticket, isLoading, isError, error } = useGetTicket(ticketId)

    if (isLoading) return <Skeleton />
    if (isError) return <Banner variant="error">{error.message}</Banner>

    return (
        <Box flexDirection="column" gap="md">
            <Heading size="lg">{ticket.subject}</Heading>
            <Text>{ticket.description}</Text>
        </Box>
    )
}
```

## Application-Level Hooks

For mutations with cache management, create wrapper hooks:

```tsx
// useDeleteMacro.ts
import {
    queryKeys,
    useDeleteMacro as useDeleteMacroPrimitive,
} from '@gorgias/helpdesk-queries'
import { useQueryClient } from '@tanstack/react-query'

export function useDeleteMacro() {
    const queryClient = useQueryClient()

    return useDeleteMacroPrimitive({
        mutation: {
            onMutate: async (params) => {
                // Cancel in-flight queries
                await queryClient.cancelQueries({
                    queryKey: queryKeys.macros.all,
                })

                // Snapshot current data
                const previousMacros = queryClient.getQueryData(
                    queryKeys.macros.all
                )

                // Optimistic update
                queryClient.setQueryData(
                    queryKeys.macros.all,
                    (old: Macro[]) => old.filter(m => m.id !== params.id)
                )

                return { previousMacros }
            },

            onError: (error, params, context) => {
                // Rollback on error
                if (context?.previousMacros) {
                    queryClient.setQueryData(
                        queryKeys.macros.all,
                        context.previousMacros
                    )
                }
            },

            onSettled: () => {
                // Refetch to ensure consistency
                queryClient.invalidateQueries({
                    queryKey: queryKeys.macros.all,
                })
            },
        },
    })
}
```

## Separation of Concerns

**Data hooks** handle:
- API calls
- Cache management
- Optimistic updates
- Error rollback

**Components** handle:
- UI rendering
- User feedback (toasts)
- Navigation
- Form state

```tsx
// Component - handles UI concerns
function DeleteMacroButton({ macroId }: { macroId: number }) {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { mutateAsync: deleteMacro, isPending } = useDeleteMacro()

    async function handleDelete() {
        try {
            await deleteMacro({ id: macroId })

            // UI concerns in component
            dispatch(notify({
                message: 'Macro deleted',
                status: NotificationStatus.Success,
            }))
            history.push('/settings/macros')

        } catch (error) {
            dispatch(notify({
                message: 'Failed to delete macro',
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

Use SDK-provided query keys for consistency:

```tsx
import { queryKeys } from '@gorgias/helpdesk-queries'

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) })

// Prefetch
queryClient.prefetchQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => getTicket(ticketId),
})
```

## Anti-Patterns

### ❌ Direct API Calls

```tsx
// Bad
const [data, setData] = useState(null)
useEffect(() => {
    fetch('/api/tickets').then(r => r.json()).then(setData)
}, [])

// Good
const { data } = useGetTickets()
```

### ❌ Redux for Server State

```tsx
// Bad
const tickets = useSelector(selectTickets)
dispatch(fetchTickets())

// Good
const { data: tickets } = useGetTickets()
```

### ❌ UI Concerns in Data Hooks

```tsx
// Bad - hook handles UI concerns
export function useDeleteMacro() {
    const dispatch = useAppDispatch()

    return useMutation({
        onSuccess: () => {
            dispatch(notify({ message: 'Deleted!' }))  // ❌ UI in data hook
        }
    })
}

// Good - component handles UI concerns
const { mutateAsync } = useDeleteMacro()
try {
    await mutateAsync({ id })
    dispatch(notify({ message: 'Deleted!' }))  // ✅ UI in component
} catch { ... }
```

### ❌ Manual Cache Updates Without Rollback

```tsx
// Bad - no rollback on error
onMutate: () => {
    queryClient.setQueryData(key, newData)
}

// Good - with rollback
onMutate: () => {
    const previous = queryClient.getQueryData(key)
    queryClient.setQueryData(key, newData)
    return { previous }
},
onError: (_, __, context) => {
    queryClient.setQueryData(key, context.previous)
}
```
