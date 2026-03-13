# Migration Guides

Step-by-step guides for common migrations in this codebase.

## Redux to SDK Migration

Migrate from Redux-based data fetching to REST API SDK.

### Overview

| Before (Redux) | After (SDK) |
|----------------|-------------|
| `createAsyncThunk` | `useGetXxx` hook |
| `useSelector` for data | `data` from hook |
| `dispatch(fetchXxx())` | Automatic fetching |
| Redux store for cache | React Query cache |

### Step-by-Step

#### 1. Identify the Redux Pattern

```tsx
// Typical Redux pattern to replace
const dispatch = useAppDispatch()
const users = useSelector(selectUsers)
const loading = useSelector(selectUsersLoading)

useEffect(() => {
    dispatch(fetchUsers())
}, [dispatch])
```

#### 2. Find the SDK Equivalent

```tsx
// Check @gorgias/helpdesk-queries for available hooks
import { useGetUsers } from '@gorgias/helpdesk-queries'
```

#### 3. Replace in Component

```tsx
// After: SDK hook
import { useGetUsers } from '@gorgias/helpdesk-queries'

function UserList() {
    const { data: users, isLoading } = useGetUsers()

    if (isLoading) return <Skeleton />
    return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

#### 4. Handle Mutations

```tsx
// Before: Redux
dispatch(updateUser({ id, name }))

// After: SDK
import { useUpdateUser } from '@gorgias/helpdesk-queries'

const { mutate: updateUser } = useUpdateUser()
updateUser({ id, data: { name } })
```

#### 5. Add Cache Invalidation if Needed

```tsx
// Create application-level hook for cache management
import { useUpdateUser as useUpdateUserPrimitive } from '@gorgias/helpdesk-queries'

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useUpdateUserPrimitive({
        mutation: {
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ['users'] })
            }
        }
    })
}
```

#### 6. Update Tests

```tsx
// Before: Mock Redux
const store = mockStore({ users: { data: mockUsers } })

// After: Mock MSW
import { mockGetUsersHandler } from '@gorgias/helpdesk-mocks'
server.use(mockGetUsersHandler().handler)
```

#### 7. Clean Up Redux

After migration is complete:
- Remove the Redux slice
- Remove selectors
- Remove from root reducer
- Remove async thunk

---

## Class Component to Hooks

Migrate class components to functional components with hooks.

### Step-by-Step

#### 1. Identify State and Lifecycle

```tsx
// Class component
class UserProfile extends Component {
    state = { user: null, loading: true }

    componentDidMount() {
        this.fetchUser()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userId !== this.props.userId) {
            this.fetchUser()
        }
    }

    fetchUser = async () => {
        const user = await api.getUser(this.props.userId)
        this.setState({ user, loading: false })
    }

    render() {
        // ...
    }
}
```

#### 2. Convert to Function

```tsx
function UserProfile({ userId }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUser() {
            const userData = await api.getUser(userId)
            setUser(userData)
            setLoading(false)
        }
        fetchUser()
    }, [userId])  // Re-run when userId changes

    // ...render
}
```

#### 3. Replace with SDK Hook (if applicable)

```tsx
function UserProfile({ userId }) {
    const { data: user, isLoading } = useGetUser(userId)

    if (isLoading) return <Skeleton />
    return <div>{user.name}</div>
}
```

---

## Direct API to SDK

Migrate from direct fetch/axios calls to SDK.

### Before

```tsx
function useUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data)
                setLoading(false)
            })
    }, [])

    return { users, loading }
}
```

### After

```tsx
import { useGetUsers } from '@gorgias/helpdesk-queries'

function useUsers() {
    const { data: users, isLoading: loading } = useGetUsers()
    return { users, loading }
}
```

Or just use the SDK hook directly in components.

---

## Test Migration: Manual Mocks to SDK Mocks

### Before

```tsx
jest.mock('../api', () => ({
    getUsers: jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }])
}))
```

### After

```tsx
import { mockGetUsersHandler } from '@gorgias/helpdesk-mocks'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
    server.use(mockGetUsersHandler().handler)
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## Migration Checklist

Before starting:
- [ ] Understand current implementation
- [ ] Identify all usages
- [ ] Ensure tests exist

During migration:
- [ ] Make incremental changes
- [ ] Run tests after each change
- [ ] Keep both implementations temporarily if needed

After migration:
- [ ] Remove old code
- [ ] Update all imports
- [ ] Run full validation
- [ ] Update documentation if needed
