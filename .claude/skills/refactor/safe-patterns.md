# Safe Refactoring Patterns

Techniques for refactoring code safely.

## Core Techniques

### Extract Function/Method

When code is doing too much, extract part of it:

```tsx
// Before
function processUser(user: User) {
    // validation logic
    if (!user.email) throw new Error('Email required')
    if (!user.name) throw new Error('Name required')

    // processing logic
    const normalized = { ...user, email: user.email.toLowerCase() }
    return normalized
}

// After
function validateUser(user: User) {
    if (!user.email) throw new Error('Email required')
    if (!user.name) throw new Error('Name required')
}

function processUser(user: User) {
    validateUser(user)
    return { ...user, email: user.email.toLowerCase() }
}
```

### Extract Component

When JSX is too complex or reusable:

```tsx
// Before
function UserList({ users }) {
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>
                    <img src={user.avatar} alt={user.name} />
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                </li>
            ))}
        </ul>
    )
}

// After
function UserListItem({ user }) {
    return (
        <li>
            <img src={user.avatar} alt={user.name} />
            <span>{user.name}</span>
            <span>{user.email}</span>
        </li>
    )
}

function UserList({ users }) {
    return (
        <ul>
            {users.map(user => (
                <UserListItem key={user.id} user={user} />
            ))}
        </ul>
    )
}
```

### Extract Hook

When state logic is complex or reusable:

```tsx
// Before
function UserProfile({ userId }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchUser(userId)
            .then(setUser)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [userId])

    // ...render
}

// After
function useUser(userId: number) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchUser(userId)
            .then(setUser)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [userId])

    return { user, loading, error }
}

function UserProfile({ userId }) {
    const { user, loading, error } = useUser(userId)
    // ...render
}
```

### Inline

The opposite of extract - when abstraction isn't helping:

```tsx
// Before: over-abstracted
const getUserName = (user: User) => user.name
const displayName = getUserName(user)

// After: inlined
const displayName = user.name
```

### Rename

Change names to be clearer:

```tsx
// Before
const d = new Date()
const fn = (u) => u.name

// After
const currentDate = new Date()
const getUserName = (user: User) => user.name
```

### Replace Conditional with Early Return

```tsx
// Before
function getDiscount(user: User) {
    let discount = 0
    if (user.isPremium) {
        if (user.years > 5) {
            discount = 0.2
        } else {
            discount = 0.1
        }
    }
    return discount
}

// After
function getDiscount(user: User) {
    if (!user.isPremium) return 0
    if (user.years > 5) return 0.2
    return 0.1
}
```

---

## Component Refactoring

### Props Cleanup

Simplify component props:

```tsx
// Before: too many props
<UserCard
    userName={user.name}
    userEmail={user.email}
    userAvatar={user.avatar}
    userRole={user.role}
/>

// After: pass object
<UserCard user={user} />
```

### State Colocation

Move state closer to where it's used:

```tsx
// Before: state lifted too high
function App() {
    const [searchTerm, setSearchTerm] = useState('')
    return <SearchBox value={searchTerm} onChange={setSearchTerm} />
}

// After: state in component that needs it
function App() {
    return <SearchBox />
}

function SearchBox() {
    const [searchTerm, setSearchTerm] = useState('')
    // ...
}
```

### Composition over Props

```tsx
// Before: render props / boolean flags
<Card showHeader={true} headerContent={<Title />} />

// After: composition
<Card>
    <Card.Header>
        <Title />
    </Card.Header>
</Card>
```

---

## Step-by-Step Safety

### The Strangler Pattern

Gradually replace old code with new:

1. Create new implementation alongside old
2. Route some traffic to new
3. Verify new works correctly
4. Route all traffic to new
5. Remove old implementation

```tsx
// Step 1: New hook exists alongside old
const oldData = useOldQuery()  // Redux
const newData = useNewQuery()  // SDK

// Step 2: Use new, fallback to old
const data = newData ?? oldData

// Step 3: Verify new works
console.log('old:', oldData, 'new:', newData)

// Step 4: Remove old
const data = useNewQuery()
```

## Verification Checklist

After each refactoring step:

- [ ] Code compiles (`pnpm typecheck <package>`)
- [ ] Tests pass (`pnpm test <package> <path-to-test>` for files being changed)
- [ ] No lint errors (`pnpm lint <package>`)
- [ ] Behavior unchanged (manual verification if needed)
- [ ] No dead code left behind
