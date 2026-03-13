---
targets:
  - '*'
---
# /migrate-to-sdk - Redux to SDK Migration Helper

Help migrate Redux-based data fetching to rest-api-sdk patterns.

## Usage

```
/migrate-to-sdk <file-path>
```

## Arguments

- `<file-path>` - Path to the file to migrate (e.g., `src/tickets/ticketSlice.ts`)

## Instructions

When the user runs this command:

1. **Analyze the file** to identify:
   - Redux async thunks for server data
   - Redux selectors for server state
   - Redux slice state related to server data
   - Components using this Redux state

2. **Create migration plan**:

### Step 1: Identify Server State in Redux

Look for patterns like:

```typescript
// Redux slice with server state
interface TicketsState {
    tickets: Ticket[]        // Server state - migrate
    loading: boolean         // Server state - migrate
    error: string | null     // Server state - migrate
    selectedId: number       // UI state - keep in Redux or component
}

// Async thunks
export const fetchTickets = createAsyncThunk(
    'tickets/fetchTickets',
    async (params) => {
        const response = await api.get('/tickets', { params })
        return response.data
    }
)

export const deleteTicket = createAsyncThunk(
    'tickets/deleteTicket',
    async (id) => {
        await api.delete(`/tickets/${id}`)
        return id
    }
)
```

### Step 2: Create SDK Hook Replacements

**For queries (data fetching):**

```typescript
// BEFORE: Redux thunk + selector
dispatch(fetchTickets({ page: 1 }))
const tickets = useSelector(selectTickets)
const loading = useSelector(selectTicketsLoading)

// AFTER: SDK query hook
import { useListTickets } from '@gorgias/helpdesk-queries'

const { data: tickets, isLoading } = useListTickets({ page: 1 })
```

**For mutations (create/update/delete):**

```typescript
// BEFORE: Redux thunk
dispatch(deleteTicket(ticketId))

// AFTER: SDK mutation hook
import { useDeleteTicket } from './queries/useDeleteTicket'

const { mutateAsync: deleteTicket } = useDeleteTicket()
await deleteTicket({ id: ticketId })
```

### Step 3: Create Wrapper Hooks if Needed

If custom logic is needed (optimistic updates, cache management):

```typescript
// src/tickets/queries/useDeleteTicket.ts
import { useQueryClient } from '@tanstack/react-query'
import {
    queryKeys,
    useDeleteTicket as useDeleteTicketPrimitive,
} from '@gorgias/helpdesk-queries'

export function useDeleteTicket() {
    const queryClient = useQueryClient()

    return useDeleteTicketPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.tickets.listTickets(),
                })
            },
        },
    })
}
```

### Step 4: Update Components

```typescript
// BEFORE
function TicketList() {
    const dispatch = useAppDispatch()
    const tickets = useSelector(selectTickets)
    const loading = useSelector(selectTicketsLoading)

    useEffect(() => {
        dispatch(fetchTickets({ page: 1 }))
    }, [dispatch])

    if (loading) return <Spinner />
    return <List items={tickets} />
}

// AFTER
function TicketList() {
    const { data: tickets, isLoading } = useListTickets({ page: 1 })

    if (isLoading) return <Spinner />
    return <List items={tickets} />
}
```

### Step 5: Update Tests

```typescript
// BEFORE: Mocking Redux
jest.mock('../ticketSlice', () => ({
    fetchTickets: jest.fn(),
    selectTickets: jest.fn(),
}))

// AFTER: Mocking SDK
import { mockListTicketsHandler } from '@gorgias/helpdesk-mocks'

const mockListTickets = mockListTicketsHandler()
const server = setupServer(mockListTickets.handler)
```

### Step 6: Clean Up Redux

After migration, remove:
- Async thunks for server data
- Selectors for server state
- Reducer cases for server state
- State properties for server data

Keep in Redux:
- UI state (selected items, filters, modal states)
- Cross-component state that isn't server data
- User preferences

3. **Generate migration checklist**:

```markdown
## Migration Checklist for ticketSlice.ts

### Queries to Create
- [ ] Replace `fetchTickets` thunk with `useListTickets`
- [ ] Replace `fetchTicket` thunk with `useGetTicket`

### Mutations to Create
- [ ] Create `useDeleteTicket` hook (with cache invalidation)
- [ ] Create `useUpdateTicket` hook (with cache invalidation)

### Components to Update
- [ ] `src/tickets/TicketList.tsx` - Uses fetchTickets
- [ ] `src/tickets/TicketDetail.tsx` - Uses fetchTicket
- [ ] `src/tickets/TicketActions.tsx` - Uses deleteTicket

### Tests to Update
- [ ] `src/tickets/tests/TicketList.spec.tsx`
- [ ] `src/tickets/tests/TicketDetail.spec.tsx`

### Redux Cleanup
- [ ] Remove server state from TicketsState interface
- [ ] Remove async thunks
- [ ] Remove server state selectors
- [ ] Remove extraReducers for server data
- [ ] Keep UI state (selectedTicketId, filters)
```

4. **Execute migration** step by step, creating hooks and updating components

## Example Migration

**Input:** `src/macros/macrosSlice.ts`

**Output:**
```
Migration Plan for macrosSlice.ts
=================================

1. Create query hooks:
   - src/macros/queries/useListMacros.ts
   - src/macros/queries/useGetMacro.ts

2. Create mutation hooks:
   - src/macros/queries/useCreateMacro.ts
   - src/macros/queries/useUpdateMacro.ts
   - src/macros/queries/useDeleteMacro.ts

3. Update components:
   - src/macros/MacrosList.tsx (uses fetchMacros)
   - src/macros/MacroDetail.tsx (uses fetchMacro)
   - src/macros/MacroForm.tsx (uses createMacro, updateMacro)

4. Update tests:
   - src/macros/tests/MacrosList.spec.tsx
   - src/macros/tests/MacroForm.spec.tsx

5. Redux cleanup:
   - Keep: selectedMacroId, searchQuery
   - Remove: macros[], loading, error, fetchMacros, etc.

Proceed with migration? (y/n)
```
