# SDK Compliance Checklist

## Data Fetching

### Must Use SDK Hooks

| Check | Status |
|-------|--------|
| Using `@gorgias/helpdesk-queries` for API calls | ⬜ |
| No direct `fetch()` or `axios` calls | ⬜ |
| No Redux `createAsyncThunk` for server data | ⬜ |
| No `useEffect` + `fetch` patterns | ⬜ |

### Correct Patterns

```tsx
// ✅ CORRECT
import { useGetTicket } from '@gorgias/helpdesk-queries'
const { data, isLoading } = useGetTicket(ticketId)

// ❌ WRONG - Direct fetch
const [data, setData] = useState(null)
useEffect(() => {
    fetch(`/api/tickets/${id}`).then(res => res.json()).then(setData)
}, [id])

// ❌ WRONG - Redux async thunk
const fetchTicket = createAsyncThunk('tickets/fetch', async (id) => {
    return api.get(`/tickets/${id}`)
})
```

## Mutations

### Separation of Concerns

| Check | Status |
|-------|--------|
| Hook handles cache management only | ⬜ |
| Component handles notifications | ⬜ |
| Component handles navigation | ⬜ |
| Component handles error UI | ⬜ |

### Correct Pattern

```tsx
// ✅ CORRECT - Hook for cache
export function useDeleteTicket() {
    const queryClient = useQueryClient()
    return useDeleteTicketPrimitive({
        mutation: {
            onMutate: async (params) => { /* cache updates */ },
            onError: (err, params, ctx) => { /* rollback */ },
            onSettled: () => { /* invalidate */ },
        },
    })
}

// ✅ CORRECT - Component for UI
function DeleteButton() {
    const dispatch = useAppDispatch()
    const { mutateAsync: deleteTicket } = useDeleteTicket()

    async function handleDelete() {
        try {
            await deleteTicket({ id })
            dispatch(notify({ message: 'Deleted', status: 'success' }))
        } catch {
            dispatch(notify({ message: 'Failed', status: 'error' }))
        }
    }
}

// ❌ WRONG - UI concerns in hook
export function useDeleteTicket() {
    const dispatch = useAppDispatch()
    return useDeleteTicketPrimitive({
        mutation: {
            onSuccess: () => {
                dispatch(notify({ message: 'Done!' })) // ❌ Wrong place
            },
        },
    })
}
```

## Cache Management

### Optimistic Updates

| Check | Status |
|-------|--------|
| `onMutate`: Cancel queries + snapshot + optimistic update | ⬜ |
| `onError`: Rollback to snapshot | ⬜ |
| `onSettled`: Invalidate queries | ⬜ |

### Query Keys

| Check | Status |
|-------|--------|
| Using `queryKeys` from SDK | ⬜ |
| Not hardcoding query key strings | ⬜ |
| Invalidating correct scope | ⬜ |

```tsx
// ✅ CORRECT
import { queryKeys } from '@gorgias/helpdesk-queries'
queryClient.invalidateQueries({ queryKey: queryKeys.tickets._def })

// ❌ WRONG
queryClient.invalidateQueries({ queryKey: ['tickets'] })
```

## Common Violations

1. **Direct API calls in useEffect**
   - Fix: Use SDK query hook

2. **Notifications in mutation hooks**
   - Fix: Move to component event handler

3. **Redux selectors for server data**
   - Fix: Use query hooks + destructure data

4. **Missing cache invalidation**
   - Fix: Add `onSettled` with invalidateQueries

5. **Hardcoded query keys**
   - Fix: Import `queryKeys` from SDK

## Related Checklists

- [Axiom UI Kit](axiom-checklist.md) - Component and styling compliance
- [Test Quality](test-checklist.md) - Testing patterns and async handling
- [Accessibility](accessibility.md) - Accessible selectors and semantic HTML
