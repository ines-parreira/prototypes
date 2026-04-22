import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { useCurrentUser } from '../useCurrentUser'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useCurrentUser', () => {
    it('returns the current user fetched from the SDK', async () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json(mockUser({ id: 2, name: 'Bob' })),
            ).handler,
        )

        const { result } = renderHook(() => useCurrentUser())

        await waitFor(() => {
            expect(result.current?.id).toBe(2)
        })
        expect(result.current?.name).toBe('Bob')
    })

    it('returns undefined while the current user is still fetching', () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json(mockUser({ id: 1, name: 'Alice' })),
            ).handler,
        )

        const { result } = renderHook(() => useCurrentUser())

        expect(result.current).toBeUndefined()
    })
})
