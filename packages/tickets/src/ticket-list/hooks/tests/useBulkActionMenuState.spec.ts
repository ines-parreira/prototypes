import { UserRole } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import { useBulkActionMenuState } from '../useBulkActionMenuState'

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

const basicAgentUser = mockUser({
    id: 2,
    email: 'basic@test.com',
    firstname: 'Basic',
    lastname: 'Agent',
    role: { name: UserRole.BasicAgent },
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(
        mockGetCurrentUserHandler(async () => HttpResponse.json(agentUser))
            .handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useBulkActionMenuState', () => {
    it('returns true for restricted bulk actions when the current user is an agent', async () => {
        const { result } = renderHook(() => useBulkActionMenuState())

        await waitFor(() => {
            expect(result.current.canUseRestrictedBulkActions).toBe(true)
        })
    })

    it('returns false for restricted bulk actions when the current user is below agent level', async () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json(basicAgentUser),
            ).handler,
        )

        const { result } = renderHook(() => useBulkActionMenuState())

        await waitFor(() => {
            expect(result.current.canUseRestrictedBulkActions).toBe(false)
        })
    })

    it('returns false when the current user is missing', async () => {
        server.use(
            mockGetCurrentUserHandler(async () => HttpResponse.json(null))
                .handler,
        )

        const { result } = renderHook(() => useBulkActionMenuState())

        await waitFor(() => {
            expect(result.current.canUseRestrictedBulkActions).toBe(false)
        })
    })
})
