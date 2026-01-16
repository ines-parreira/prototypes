# Mocking Patterns

Patterns for mocking in complex testing scenarios.

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
    })
)
server.use(handler)
```

### Error Response

```tsx
const { handler } = mockGetUserHandler(async () =>
    HttpResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 }
    )
)
server.use(handler)
```

### Network Error

```tsx
const { handler } = mockGetUserHandler(async () =>
    HttpResponse.error()
)
server.use(handler)
```

### Delayed Response

```tsx
import { delay } from 'msw'

const { handler } = mockGetUserHandler(async () => {
    await delay(1000) // 1 second delay
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
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}

beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    })
})

it('saves to localStorage', () => {
    // ... trigger action
    expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value')
})
```

### window.location

```tsx
const mockLocation = {
    href: 'http://localhost/',
    pathname: '/test',
    search: '?foo=bar',
    assign: jest.fn(),
    replace: jest.fn(),
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
        value: jest.fn().mockImplementation(query => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    })
})
```

### IntersectionObserver

```tsx
beforeEach(() => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
    })
    window.IntersectionObserver = mockIntersectionObserver
})
```

## Mocking Timers

### Fake Timers

```tsx
beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

it('shows message after delay', async () => {
    render(<DelayedMessage delay={5000} />)

    expect(screen.queryByText('Hello')).not.toBeInTheDocument()

    // Fast-forward time
    act(() => {
        jest.advanceTimersByTime(5000)
    })

    expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Mock Date

```tsx
beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'))
})

afterEach(() => {
    jest.useRealTimers()
})

it('shows correct relative time', () => {
    render(<TimeAgo date={new Date('2024-01-15T09:00:00Z')} />)
    expect(screen.getByText('1 hour ago')).toBeInTheDocument()
})
```

## Mocking Modules

### Mock Entire Module

```tsx
jest.mock('@/utils/analytics', () => ({
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
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

### Partial Mock

```tsx
jest.mock('@/utils/helpers', () => ({
    ...jest.requireActual('@/utils/helpers'),
    generateId: jest.fn(() => 'mock-id'),
}))
```

### Mock Return Value per Test

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

jest.mock('@/hooks/useFeatureFlag')

it('shows new UI when flag enabled', () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(true)
    render(<Component />)
    expect(screen.getByText('New Feature')).toBeInTheDocument()
})

it('shows old UI when flag disabled', () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(false)
    render(<Component />)
    expect(screen.queryByText('New Feature')).not.toBeInTheDocument()
})
```

## Common Pitfalls

### Mock Cleanup

Always reset mocks between tests:

```tsx
afterEach(() => {
    jest.clearAllMocks()  // Clear call counts
    jest.resetAllMocks()  // Reset implementations
})
```

### Order of Mock Handlers

Later handlers override earlier ones:

```tsx
beforeEach(() => {
    server.use(mockGetUsers().handler)  // Default
})

it('handles empty list', () => {
    server.use(mockGetUsers(() => HttpResponse.json([])).handler)  // Override
    // This test uses empty list
})

// Next test automatically gets default handler back
```

### Avoid Over-Mocking

```tsx
// ❌ Bad - mocking implementation details
jest.mock('./UserCard', () => ({ UserCard: () => <div>Mock</div> }))

// ✅ Good - mock only external boundaries (APIs, browser APIs)
// Let components render normally
```
