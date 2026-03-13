---
targets:
  - '*'
---
# /generate-mock-setup - MSW Mock Setup Generator

Generate MSW (Mock Service Worker) handler setup for test files.

## Usage

```
/generate-mock-setup <file-path>
```

## Arguments

- `<file-path>` - Path to the component or hook to analyze (e.g., `src/pages/settings/teams/TeamForm.tsx`)

## Instructions

When the user runs this command:

1. **Analyze the target file** to identify:
    - SDK query hooks used (e.g., `useGetTeam`, `useListUsers`)
    - SDK mutation hooks used (e.g., `useUpdateTeam`, `useDeleteTeam`)
    - Which SDK package they come from:
        - `@gorgias/helpdesk-queries` -> `@gorgias/helpdesk-mocks`
        - `@gorgias/knowledge-service-queries` -> `@gorgias/knowledge-service-mocks`
        - `@gorgias/help-center-queries` -> `@gorgias/help-center-mocks`
        - `@gorgias/convert-queries` -> `@gorgias/convert-mocks`
        - `@gorgias/ecommerce-storage-queries` -> `@gorgias/ecommerce-storage-mocks`

2. **Map hooks to mock handlers**:
    - `useGetXxx` -> `mockGetXxxHandler` from the corresponding mocks package
    - `useListXxx` -> `mockListXxxHandler`
    - `useUpdateXxx` -> `mockUpdateXxxHandler`
    - `useDeleteXxx` -> `mockDeleteXxxHandler`
    - `useCreateXxx` -> `mockCreateXxxHandler`

3. **Generate mock setup code**:

### Basic Setup Template

```typescript
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetTeamHandler,
    mockListUsersHandler,
    mockUpdateTeamHandler,
} from '@gorgias/helpdesk-mocks'

// Initialize mock handlers with default responses
const mockGetTeam = mockGetTeamHandler()
const mockUpdateTeam = mockUpdateTeamHandler()
const mockListUsers = mockListUsersHandler()

// Collect all handlers
const localHandlers = [
    mockGetTeam.handler,
    mockUpdateTeam.handler,
    mockListUsers.handler,
]

// Setup MSW server
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})
```

### Handler Override Examples

Generate examples for common test scenarios:

```typescript
// Override with custom data
it('should display team with custom name', async () => {
    const { handler } = mockGetTeamHandler(async () =>
        HttpResponse.json({
            ...mockGetTeam.data,
            name: 'Custom Team Name',
            description: 'Custom description',
        }),
    )
    server.use(handler)

    // ... test implementation
})

// Override with error response
it('should handle API error', async () => {
    const { handler } = mockGetTeamHandler(async () =>
        HttpResponse.json(
            { error: { msg: 'Team not found' } },
            { status: 404 },
        ),
    )
    server.use(handler)

    // ... test implementation
})

// Override with empty list
it('should display empty state', async () => {
    const { handler } = mockListUsersHandler(async () =>
        HttpResponse.json({ data: [] }),
    )
    server.use(handler)

    // ... test implementation
})

// Override with specific user role
it('should handle admin user', async () => {
    const { handler } = mockGetCurrentUserHandler(async () =>
        HttpResponse.json({
            ...mockGetCurrentUser.data,
            role: { name: 'admin' },
        }),
    )
    server.use(handler)

    // ... test implementation
})
```

### Request Assertion Pattern

```typescript
// Verify mutation request payload
it('should send correct update payload', async () => {
    const waitForUpdateRequest = mockUpdateTeam.waitForRequest(server)

    // Trigger mutation
    await user.click(screen.getByRole('button', { name: /save/i }))

    // Assert request payload
    await waitForUpdateRequest(async (request) => {
        const body = await request.json()
        expect(body).toEqual({
            name: 'Updated Team Name',
            description: 'Updated description',
        })
    })
})
```

### Multiple Services Template

If the component uses hooks from multiple SDK packages:

```typescript
import {
    mockGetTicketHandler,
    mockListMessagesHandler,
} from '@gorgias/helpdesk-mocks'
import {
    mockGetArticleHandler,
    mockSearchArticlesHandler,
} from '@gorgias/knowledge-service-mocks'

// Helpdesk API mocks
const mockGetTicket = mockGetTicketHandler()
const mockListMessages = mockListMessagesHandler()

// Knowledge Service API mocks
const mockGetArticle = mockGetArticleHandler()
const mockSearchArticles = mockSearchArticlesHandler()

const localHandlers = [
    // Helpdesk handlers
    mockGetTicket.handler,
    mockListMessages.handler,
    // Knowledge Service handlers
    mockGetArticle.handler,
    mockSearchArticles.handler,
]
```

4. **Output the generated code** with:
    - Import statements
    - Handler initialization
    - Server setup lifecycle
    - Example overrides relevant to the component
    - Request assertion patterns if mutations are used
