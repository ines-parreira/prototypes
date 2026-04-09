import { UserRole } from '@repo/permissions'
import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { useCurrentUserRole } from '../useCurrentUserRole'

const agentUser = mockUser({ id: 1, role: { name: UserRole.Agent } })
const adminUser = mockUser({ id: 2, role: { name: UserRole.Admin } })

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

describe('useCurrentUserRole', () => {
    describe('isAdmin', () => {
        it('returns false before user data is loaded', () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(agentUser),
                ).handler,
            )

            const { result } = renderHook(() => useCurrentUserRole())

            expect(result.current.isAdmin).toBe(false)
        })

        it('returns false when the user is not an admin', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(agentUser),
                ).handler,
            )

            const { result } = renderHook(() => useCurrentUserRole())

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(false)
            })
        })

        it('returns true when the user is an admin', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(adminUser),
                ).handler,
            )

            const { result } = renderHook(() => useCurrentUserRole())

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(true)
            })
        })
    })

    describe('hasRole', () => {
        it('returns false before user data is loaded', () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(agentUser),
                ).handler,
            )

            const { result } = renderHook(() => useCurrentUserRole())

            expect(result.current.hasRole(UserRole.Admin)).toBe(false)
        })

        it('returns true when the user has the required role', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(adminUser),
                ).handler,
            )

            const { result } = renderHook(() => useCurrentUserRole())

            await waitFor(() => {
                expect(result.current.hasRole(UserRole.Admin)).toBe(true)
            })
        })
    })

    describe('currentUser', () => {
        it('returns the current user once data is loaded', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(agentUser),
                ).handler,
            )

            const { result } = renderHook(() => useCurrentUserRole())

            await waitFor(() => {
                expect(result.current.currentUser).toBeDefined()
            })
            expect(result.current.currentUser?.id).toBe(1)
        })
    })
})
