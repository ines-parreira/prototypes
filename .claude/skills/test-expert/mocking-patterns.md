# Mocking Patterns

Patterns for mocking in complex testing scenarios.

These patterns move consumer tests away from shared query clients and React Query internals, and toward MSW-backed flows plus observable assertions.

The snippets below default to Vitest because extracted packages usually do. In `apps/helpdesk`, replace `vi` with `jest` and follow the neighboring monolith helpers. Local package config and nearby tests override the folder heuristic when a package is an exception.

## MSW Handler Patterns

### Basic Handler

```tsx
import { mockGetUserHandler } from '@gorgias/helpdesk-mocks'

const mockGetUser = mockGetUserHandler()
server.use(mockGetUser.handler)
```

### Custom Response

```tsx
const { handler } = mockGetUserHandler(async () =>
    HttpResponse.json({
        id: 1,
        name: 'Custom User',
        email: 'custom@example.com',
    }),
)

server.use(handler)
```

### Error Response

```tsx
const { handler } = mockGetUserHandler(async () =>
    HttpResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 },
    ),
)

server.use(handler)
```

### Network Error

```tsx
const { handler } = mockGetUserHandler(async () => HttpResponse.error())
server.use(handler)
```

### Delayed Response

```tsx
import { delay } from 'msw'

const { handler } = mockGetUserHandler(async () => {
    await delay(1000)
    return HttpResponse.json(mockData)
})

server.use(handler)
```

### Dynamic Response Based on Request

```tsx
const { handler } = mockGetUserHandler(async ({ request }) => {
    const url = new URL(request.url)
    const userId = url.pathname.split('/').pop()

    if (userId === '999') {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json({ id: userId, name: 'User' })
})
```

## Request Assertions

### Assert Request Was Made

```tsx
const waitForRequest = mockUpdateUser.waitForRequest(server)

await user.click(saveButton)

await waitForRequest(async (request) => {
    const body = await request.json()
    expect(body.name).toBe('New Name')
    expect(body.email).toBe('new@example.com')
})
```

Prefer `waitForRequest(server)` or visible UI assertions over polling `queryClient.isFetching()`, mutation spies, or other implementation details. That matches Testing Library's [guiding principles](https://testing-library.com/docs/guiding-principles/).

### Assert Headers

```tsx
await waitForRequest(async (request) => {
    expect(request.headers.get('Authorization')).toBe('Bearer token')
    expect(request.headers.get('Content-Type')).toBe('application/json')
})
```

### Assert Query Parameters

```tsx
await waitForRequest(async (request) => {
    const url = new URL(request.url)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('10')
})
```

## Mocking Browser APIs

### localStorage

```tsx
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}

beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    })
})
```

### window.location

```tsx
const mockLocation = {
    href: 'http://localhost/',
    pathname: '/test',
    search: '?foo=bar',
    assign: vi.fn(),
    replace: vi.fn(),
}

beforeEach(() => {
    Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
    })
})
```

### matchMedia

```tsx
beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
})
```

### IntersectionObserver

```tsx
beforeEach(() => {
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    })
    window.IntersectionObserver = mockIntersectionObserver
})
```

## Mocking Timers

### Fake Timers

```tsx
beforeEach(() => {
    vi.useFakeTimers() // Use jest.useFakeTimers() in apps/helpdesk
})

afterEach(() => {
    vi.runOnlyPendingTimers() // Use jest.runOnlyPendingTimers() in apps/helpdesk
    vi.useRealTimers() // Use jest.useRealTimers() in apps/helpdesk
})

it('shows message after delay', async () => {
    const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
    })

    render(<DelayedMessage delay={5000} />)

    expect(screen.queryByText('Hello')).not.toBeInTheDocument()

    act(() => {
        vi.advanceTimersByTime(5000) // Use jest.advanceTimersByTime(...) in apps/helpdesk
    })

    expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

Use fake timers only for debounce or timer-driven behavior. Testing Library recommends `advanceTimers` instead of `delay: null`: <https://testing-library.com/docs/user-event/options/#advancetimers>.

### Mock Date

```tsx
beforeEach(() => {
    vi.useFakeTimers() // Use jest.useFakeTimers() in apps/helpdesk
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z')) // Use jest.setSystemTime(...) in apps/helpdesk
})

afterEach(() => {
    vi.runOnlyPendingTimers() // Use jest.runOnlyPendingTimers() in apps/helpdesk
    vi.useRealTimers() // Use jest.useRealTimers() in apps/helpdesk
})

it('shows correct relative time', () => {
    render(<TimeAgo date={new Date('2024-01-15T09:00:00Z')} />)
    expect(screen.getByText('1 hour ago')).toBeInTheDocument()
})
```

## Mocking Modules

### Mock Entire Module

```tsx
vi.mock('@/utils/analytics', () => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
}))

import { trackEvent } from '@/utils/analytics'

it('tracks button click', async () => {
    const { user } = renderComponent()

    await user.click(screen.getByRole('button'))

    expect(trackEvent).toHaveBeenCalledWith('button_click', {
        buttonName: 'submit',
    })
})
```

Do not mock foundational integration packages. Mocking `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` is a severe anti-pattern because it replaces the provider, router, cache, or SDK hook behavior that integration tests should exercise. Use shared render helpers for providers/router/query setup and SDK MSW handlers for server data.

### Partial Mock

```tsx
vi.mock('@/utils/helpers', async () => ({
    ...(await vi.importActual('@/utils/helpers')),
    generateId: vi.fn(() => 'mock-id'),
}))
```

### Mock Return Value per Test

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

vi.mock('@/hooks/useFeatureFlag')

it('shows new UI when flag enabled', () => {
    vi.mocked(useFeatureFlag).mockReturnValue(true)
    render(<Component />)
    expect(screen.getByText('New Feature')).toBeInTheDocument()
})

it('shows old UI when flag disabled', () => {
    vi.mocked(useFeatureFlag).mockReturnValue(false)
    render(<Component />)
    expect(screen.queryByText('New Feature')).not.toBeInTheDocument()
})
```

## Common Pitfalls

### Mock Cleanup

```tsx
afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
})
```

### Order of Mock Handlers

```tsx
beforeEach(() => {
    server.use(mockGetUsers().handler)
})

it('handles empty list', () => {
    server.use(mockGetUsers(() => HttpResponse.json([])).handler)
})
```

### Avoid Over-Mocking

```tsx
// BAD - mocking implementation details
vi.mock('./UserCard', () => ({ UserCard: () => <div>Mock</div> }))

// BAD - mocking Axiom components hides accessibility and provider behavior
vi.mock('@gorgias/axiom')

// BAD - mocking router packages hides navigation and route-state behavior
vi.mock('react-router-dom')

// BAD - mocking TanStack Query hides cache, retry, and async behavior
vi.mock('@tanstack/react-query')

// BAD - mocking query hooks or seeding cache just to restate React Query behavior
vi.mock('@gorgias/helpdesk-queries', () => ({ useListUsers: vi.fn() }))

// GOOD - mock external boundaries (APIs, browser APIs)
// Let components and query hooks run against MSW-backed data
```
