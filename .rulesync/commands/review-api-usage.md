---
targets:
  - '*'
---
# /review-api-usage - REST API SDK Compliance Review

Review code for rest-api-sdk pattern compliance and identify areas needing migration.

## Usage

```
/review-api-usage <path>
```

## Arguments

- `<path>` - Path to a file or directory to review (e.g., `src/pages/aiAgent/`)

## Instructions

When the user runs this command:

1. **Find relevant files** in the specified path:
   - Look for `.ts` and `.tsx` files
   - Focus on components, hooks, and slices

2. **Review for the following issues:**

### Direct API Calls (High Priority)

Check for direct fetch/axios usage that should use SDK:

**Flag as issue:**
```typescript
// BAD - direct fetch
const response = await fetch('/api/tickets')
const data = await response.json()

// BAD - axios calls
import axios from 'axios'
const ticket = await axios.get(`/tickets/${id}`)

// BAD - custom API client
import { api } from '../api'
const result = await api.get('/users')
```

**Suggest instead:**
```typescript
// GOOD - use SDK hooks
import { useGetTicket } from '@gorgias/helpdesk-queries'
const { data: ticket, isLoading } = useGetTicket(ticketId)
```

### Redux Server State (High Priority)

Check for Redux being used for server data:

**Flag as issue:**
```typescript
// BAD - Redux async thunks for server data
export const fetchTicket = createAsyncThunk(
    'tickets/fetchTicket',
    async (id) => {
        const response = await api.get(`/tickets/${id}`)
        return response.data
    }
)

// BAD - Redux selectors for server data
const selectTicket = (state, id) => state.tickets.entities[id]
```

**Suggest instead:**
```typescript
// GOOD - use SDK queries
import { useGetTicket } from '@gorgias/helpdesk-queries'
const { data: ticket } = useGetTicket(id)
```

### Concern Separation in Hooks (Medium Priority)

Check mutation hooks for proper separation:

**Flag as issue:**
```typescript
// BAD - UI concerns in data hook
export function useDeleteMacro() {
    const dispatch = useAppDispatch()
    const history = useHistory()

    return useDeleteMacroPrimitive({
        mutation: {
            onSuccess: () => {
                dispatch(notify({ message: 'Success!' })) // UI concern
                history.push('/macros') // Navigation concern
            },
        },
    })
}
```

**Suggest instead:**
```typescript
// GOOD - data hook handles only cache concerns
export function useDeleteMacro() {
    const queryClient = useQueryClient()
    return useDeleteMacroPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({ queryKey })
            },
        },
    })
}

// UI concerns in component event handler
async function handleDelete() {
    try {
        await deleteMacro({ id })
        dispatch(notify({ message: 'Success!' }))
        history.push('/macros')
    } catch (error) {
        dispatch(notify({ message: 'Error', status: 'error' }))
    }
}
```

### Missing Query Client Usage (Medium Priority)

Check for missing cache invalidation/updates:

**Flag as issue:**
```typescript
// BAD - mutation without cache invalidation
export function useUpdateTeam() {
    return useUpdateTeamPrimitive() // No cache handling
}
```

**Suggest instead:**
```typescript
// GOOD - mutation with proper cache management
export function useUpdateTeam() {
    const queryClient = useQueryClient()
    return useUpdateTeamPrimitive({
        mutation: {
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.teams.listTeams()
                })
            },
        },
    })
}
```

3. **Generate report** with:
   - List of issues found, grouped by type
   - File path and line number for each issue
   - Suggested migration/fix for each issue
   - Priority for migration (high = direct API calls, medium = Redux server state)

## Example Output

```
API Usage Review: src/pages/settings/macros/
============================================

HIGH PRIORITY - Direct API Calls:

1. src/pages/settings/macros/MacroService.ts:23
   Found: axios.get('/api/macros')
   Suggest: Use useListMacros from @gorgias/helpdesk-queries

2. src/pages/settings/macros/MacroService.ts:45
   Found: fetch('/api/macros/${id}', { method: 'DELETE' })
   Suggest: Use useDeleteMacro from @gorgias/helpdesk-queries

HIGH PRIORITY - Redux Server State:

3. src/pages/settings/macros/macrosSlice.ts:12
   Found: createAsyncThunk for fetching macros
   Suggest: Migrate to useListMacros hook

MEDIUM PRIORITY - Concern Separation:

4. src/pages/settings/macros/hooks/useDeleteMacro.ts:15
   Found: dispatch(notify(...)) in mutation onSuccess
   Suggest: Move notification to component event handler

Summary:
- 2 direct API calls to migrate
- 1 Redux slice to migrate
- 1 hook to refactor for concern separation
```
