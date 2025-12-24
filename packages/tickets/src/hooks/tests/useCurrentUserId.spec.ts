import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useCurrentUserId } from '../useCurrentUserId'

const currentUser = mockUser({
    id: 123,
    name: 'Test User',
    email: 'test@example.com',
})

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(currentUser),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetCurrentUser.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useCurrentUserId', () => {
    it('should return the current user ID when user data is loaded', async () => {
        const { result } = renderHook(() => useCurrentUserId())

        await waitFor(() => {
            expect(result.current.currentUserId).toBe(123)
        })
    })

    it('should return undefined when user data is not yet loaded', () => {
        const { result } = renderHook(() => useCurrentUserId())

        expect(result.current.currentUserId).toBeUndefined()
    })

    it('should return undefined when current user data has no data property', async () => {
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json(null),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserId())

        await waitFor(() => {
            expect(result.current.currentUserId).toBeUndefined()
        })
    })

    it('should return undefined when current user data has no id', async () => {
        const userWithoutId = mockUser({
            id: undefined as unknown as number,
            name: 'Test User',
            email: 'test@example.com',
        })
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json(userWithoutId),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserId())

        await waitFor(() => {
            expect(result.current.currentUserId).toBeUndefined()
        })
    })
})
