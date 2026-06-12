import { isTeamLead } from '@repo/permissions'
import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { useCanAccessAIFeedback } from '../useCanAccessAIFeedback'

vi.mock('@repo/permissions', () => ({
    isTeamLead: vi.fn(),
}))

const mockIsTeamLead = vi.mocked(isTeamLead)
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

describe('useCanAccessAIFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns false when the current user is not loaded', () => {
        server.use(
            mockGetCurrentUserHandler(async () => new Promise(() => undefined))
                .handler,
        )

        const { result } = renderHook(() => useCanAccessAIFeedback())

        expect(result.current).toBe(false)
        expect(mockIsTeamLead).not.toHaveBeenCalled()
    })

    it('returns false when the current user payload is missing', () => {
        server.use(
            mockGetCurrentUserHandler(async () => HttpResponse.json(null))
                .handler,
        )

        const { result } = renderHook(() => useCanAccessAIFeedback())

        expect(result.current).toBe(false)
        expect(mockIsTeamLead).not.toHaveBeenCalled()
    })

    it('returns the team lead check result when the current user exists', () => {
        const currentUser = mockUser({
            id: 123,
        })

        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json(currentUser),
            ).handler,
        )
        mockIsTeamLead.mockReturnValue(true)

        const { result } = renderHook(() => useCanAccessAIFeedback())

        return waitFor(() => {
            expect(result.current).toBe(true)
            expect(mockIsTeamLead).toHaveBeenCalledWith(currentUser)
        })
    })
})
