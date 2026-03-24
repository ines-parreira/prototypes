import { isTeamLead } from '@repo/utils'
import { renderHook } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { useCanAccessAIFeedback } from '../useCanAccessAIFeedback'

vi.mock('@repo/utils', () => ({
    isTeamLead: vi.fn(),
}))

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useGetCurrentUser: vi.fn(),
    }
})

const mockUseGetCurrentUser = vi.mocked(useGetCurrentUser)
const mockIsTeamLead = vi.mocked(isTeamLead)

describe('useCanAccessAIFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns false when the current user is not loaded', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: undefined,
        } as ReturnType<typeof useGetCurrentUser>)

        const { result } = renderHook(() => useCanAccessAIFeedback())

        expect(result.current).toBe(false)
        expect(mockIsTeamLead).not.toHaveBeenCalled()
    })

    it('returns false when the current user payload is missing', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {},
        } as ReturnType<typeof useGetCurrentUser>)

        const { result } = renderHook(() => useCanAccessAIFeedback())

        expect(result.current).toBe(false)
        expect(mockIsTeamLead).not.toHaveBeenCalled()
    })

    it('returns the team lead check result when the current user exists', () => {
        const currentUser = {
            id: 123,
            role: 'team_lead',
        }

        mockUseGetCurrentUser.mockReturnValue({
            data: { data: currentUser },
        } as ReturnType<typeof useGetCurrentUser>)
        mockIsTeamLead.mockReturnValue(true)

        const { result } = renderHook(() => useCanAccessAIFeedback())

        expect(result.current).toBe(true)
        expect(mockIsTeamLead).toHaveBeenCalledWith(currentUser)
    })
})
