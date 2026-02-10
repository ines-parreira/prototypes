import { useListUserAvailabilities } from '@repo/agent-status'
import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'

import { usePerformancePageAgentAvailabilities } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentAvailabilities'
import * as selectors from 'state/entities/stats/selectors'
import type { RootState } from 'state/types'

jest.mock('@repo/agent-status', () => ({
    useListUserAvailabilities: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: (selector: typeof selectors.getUserIdsFromLiveAgentsPerformance) =>
        selector({ entities: { stats: {} } } as RootState),
}))

jest.mock('state/entities/stats/selectors', () => ({
    getUserIdsFromLiveAgentsPerformance: jest.fn(),
}))

const useListUserAvailabilitiesMock = assumeMock(useListUserAvailabilities)
const getUserIdsFromLiveAgentsPerformanceMock = assumeMock(
    selectors.getUserIdsFromLiveAgentsPerformance,
)

describe('usePerformancePageAgentAvailabilities', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useListUserAvailabilitiesMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
    })

    it('should extract user IDs from selector and call useListUserAvailabilities when enabled', () => {
        getUserIdsFromLiveAgentsPerformanceMock.mockReturnValue([1, 2, 3])

        renderHook(() =>
            usePerformancePageAgentAvailabilities({ enabled: true }),
        )

        expect(useListUserAvailabilitiesMock).toHaveBeenCalledWith({
            userIds: [1, 2, 3],
            enabled: true,
        })
    })

    it('should call useListUserAvailabilities with enabled=false when disabled', () => {
        getUserIdsFromLiveAgentsPerformanceMock.mockReturnValue([1, 2, 3])

        renderHook(() =>
            usePerformancePageAgentAvailabilities({ enabled: false }),
        )

        expect(useListUserAvailabilitiesMock).toHaveBeenCalledWith({
            userIds: [1, 2, 3],
            enabled: false,
        })
    })

    it('should call useListUserAvailabilities with enabled=false when no user IDs', () => {
        getUserIdsFromLiveAgentsPerformanceMock.mockReturnValue([])

        renderHook(() =>
            usePerformancePageAgentAvailabilities({ enabled: true }),
        )

        expect(useListUserAvailabilitiesMock).toHaveBeenCalledWith({
            userIds: [],
            enabled: false,
        })
    })
})
