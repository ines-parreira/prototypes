import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateUserHandler,
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { CreateUserBody } from '@gorgias/helpdesk-queries'

import { useAllUsers } from '../useAllUsers'
import { useCreateUser } from '../useCreateUser'

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

const newUserBody: CreateUserBody = {
    email: 'charlie@example.com',
    name: 'Charlie',
    role: { name: 'agent' },
}

describe('useCreateUser', () => {
    it('prepends the created user to the cached listing', async () => {
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [mockUser({ id: 1, name: 'Alice' })],
                        meta: { prev_cursor: null, next_cursor: null },
                    }),
                ),
            ).handler,
            mockCreateUserHandler(async () =>
                HttpResponse.json(mockUser({ id: 42, name: 'Charlie' })),
            ).handler,
        )

        const { result } = renderHook(() => ({
            users: useAllUsers(),
            create: useCreateUser(),
        }))

        await waitFor(() => {
            expect(result.current.users).toHaveLength(1)
        })

        await result.current.create.mutateAsync({ data: newUserBody })

        await waitFor(() => {
            expect(result.current.users).toHaveLength(2)
        })
        expect(result.current.users.map((user) => user.id)).toEqual([42, 1])
    })

    it('does not change the cached listing when the request fails', async () => {
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [mockUser({ id: 1, name: 'Alice' })],
                        meta: { prev_cursor: null, next_cursor: null },
                    }),
                ),
            ).handler,
            mockCreateUserHandler(
                async () => new HttpResponse(null, { status: 400 }),
            ).handler,
        )

        const { result } = renderHook(() => ({
            users: useAllUsers(),
            create: useCreateUser(),
        }))

        await waitFor(() => {
            expect(result.current.users).toHaveLength(1)
        })

        await expect(
            result.current.create.mutateAsync({ data: newUserBody }),
        ).rejects.toBeDefined()

        expect(result.current.users).toHaveLength(1)
        expect(result.current.users[0]?.id).toBe(1)
    })
})
