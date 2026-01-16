# Code Style

Guidelines for writing clean, maintainable code.

## Comments

### When to Comment

✅ **Do comment:**
- Complex business logic
- Non-obvious "why" decisions
- Workarounds with context
- Public API documentation

❌ **Don't comment:**
- What the code does (it should be self-evident)
- Obvious operations
- Every function/variable

### Examples

```typescript
// ❌ Bad - states the obvious
// Calculate total by adding price and tax
const total = price + tax

// ✅ Good - explains the why
// Legacy customers signed up before 2023 get 15% off regardless of subscription
const legacyDiscount = user.signupDate < new Date('2023-01-01') ? 0.15 : 0

// ❌ Bad - redundant
// Check if user is admin
if (user.role === 'admin') { ... }

// ✅ Good - no comment needed, code is clear
if (user.role === 'admin') { ... }
```

### JSDoc

Use only for public APIs or complex signatures:

```typescript
// ✅ Good - documents public utility
/**
 * Formats a date relative to now (e.g., "2 hours ago", "yesterday")
 * @param date - The date to format
 * @param locale - Optional locale (defaults to user's locale)
 */
export function formatRelativeDate(date: Date, locale?: string): string

// ❌ Bad - obvious internal function
/**
 * Gets the user's name
 * @param user - The user object
 * @returns The user's name
 */
function getUserName(user: User): string {
    return user.name
}
```

## Naming

### Variables

```typescript
// ❌ Bad
const d = new Date()
const u = users.find(x => x.id === id)
const flag = true

// ✅ Good
const currentDate = new Date()
const selectedUser = users.find(user => user.id === id)
const isEnabled = true
```

### Booleans

Prefix with `is`, `has`, `can`, `should`:

```typescript
// ❌ Bad
const loading = true
const admin = user.role === 'admin'
const visible = true

// ✅ Good
const isLoading = true
const isAdmin = user.role === 'admin'
const isVisible = true
const hasPermission = checkPermission(user)
const canEdit = isAdmin && !isLocked
```

### Functions

Use verbs, be specific:

```typescript
// ❌ Bad
function data() { ... }
function process(user) { ... }
function handle() { ... }

// ✅ Good
function fetchUserData() { ... }
function validateUserEmail(user) { ... }
function handleFormSubmit() { ... }
```

### Components

PascalCase, noun-based:

```typescript
// ❌ Bad
function renderUser() { ... }
function ShowTicketList() { ... }

// ✅ Good
function UserProfile() { ... }
function TicketList() { ... }
```

### Hooks

camelCase with `use` prefix:

```typescript
// ❌ Bad
function GetUser() { ... }
function userData() { ... }

// ✅ Good
function useUser() { ... }
function useTicketFilters() { ... }
```

## TypeScript

### Prefer Inference

Let TypeScript infer when possible:

```typescript
// ❌ Redundant type annotation
const count: number = 0
const name: string = 'John'
const users: User[] = useGetUsers().data

// ✅ Let TypeScript infer
const count = 0
const name = 'John'
const { data: users } = useGetUsers()
```

### Annotate Function Signatures

```typescript
// ✅ Annotate parameters and return types for exported functions
export function calculateDiscount(price: number, rate: number): number {
    return price * rate
}

// ✅ Or use explicit type
type CalculateDiscount = (price: number, rate: number) => number
export const calculateDiscount: CalculateDiscount = (price, rate) => {
    return price * rate
}
```

### Avoid `any`

```typescript
// ❌ Bad
function processData(data: any) { ... }

// ✅ Good - use unknown and narrow
function processData(data: unknown) {
    if (isValidData(data)) {
        // data is typed here
    }
}

// ✅ Good - use generics
function processData<T extends BaseData>(data: T) { ... }
```

### Use Union Types

```typescript
// ❌ Bad
type Status = string

// ✅ Good
type Status = 'pending' | 'active' | 'completed'
```

## Code Organization

### Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. External packages
import { useQuery } from '@tanstack/react-query'

// 3. Internal packages (@gorgias/*, @repo/*)
import { useGetUser } from '@gorgias/helpdesk-queries'
import { Button } from '@gorgias/axiom'

// 4. Relative imports
import { UserCard } from './UserCard'
import { formatDate } from '../utils'
import styles from './styles.module.less'
```

### Component Structure

```tsx
// 1. Types/interfaces
interface UserProfileProps {
    userId: number
    onEdit: () => void
}

// 2. Component
export function UserProfile({ userId, onEdit }: UserProfileProps) {
    // 2a. Hooks (state, context, queries)
    const { data: user, isLoading } = useGetUser(userId)
    const [isEditing, setIsEditing] = useState(false)

    // 2b. Derived state
    const displayName = user?.name ?? 'Unknown'

    // 2c. Effects
    useEffect(() => {
        // ...
    }, [])

    // 2d. Handlers
    function handleEdit() {
        setIsEditing(true)
        onEdit()
    }

    // 2e. Early returns
    if (isLoading) return <Skeleton />

    // 2f. Render
    return (
        <div>
            <h1>{displayName}</h1>
            <button onClick={handleEdit}>Edit</button>
        </div>
    )
}
```

## Keep It Simple

### Avoid Over-Engineering

```typescript
// ❌ Over-engineered for simple case
const UserNameDisplay = ({ user }) => <span>{user.name}</span>
const UserEmailDisplay = ({ user }) => <span>{user.email}</span>
const UserAvatarDisplay = ({ user }) => <img src={user.avatar} />

function UserCard({ user }) {
    return (
        <div>
            <UserAvatarDisplay user={user} />
            <UserNameDisplay user={user} />
            <UserEmailDisplay user={user} />
        </div>
    )
}

// ✅ Simple and clear
function UserCard({ user }) {
    return (
        <div>
            <img src={user.avatar} alt={user.name} />
            <span>{user.name}</span>
            <span>{user.email}</span>
        </div>
    )
}
```

### Avoid Premature Abstraction

```typescript
// ❌ Abstraction for one use case
function createUserFetcher(options) {
    return function useFetchUser(id) {
        return useQuery({ ...options, queryKey: ['user', id] })
    }
}

// ✅ Just use the hook directly
function useUser(id: number) {
    return useGetUser(id)
}
```
