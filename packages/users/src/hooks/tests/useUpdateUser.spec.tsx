import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUpdateUserHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { useAllUsers } from '../useAllUsers'
import { useUpdateUser } from '../useUpdateUser'

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

describe('useUpdateUser', () => {
    it('replaces the user in the cached listing with the response', async () => {
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [
                            mockUser({ id: 1, name: 'Alice' }),
                            mockUser({ id: 2, name: 'Bob' }),
                        ],
                        meta: { prev_cursor: null, next_cursor: null },
                    }),
                ),
            ).handler,
            mockUpdateUserHandler(async () =>
                HttpResponse.json(mockUser({ id: 2, name: 'Bobby' })),
            ).handler,
        )

        const { result } = renderHook(() => ({
            users: useAllUsers(),
            update: useUpdateUser(),
        }))

        await waitFor(() => {
            expect(result.current.users).toHaveLength(2)
        })

        await result.current.update.mutateAsync({
            id: 2,
            data: { name: 'Bobby' },
        })

        await waitFor(() => {
            expect(
                result.current.users.find((user) => user.id === 2)?.name,
            ).toBe('Bobby')
        })
        expect(result.current.users.map((user) => user.id)).toEqual([1, 2])
    })
})
