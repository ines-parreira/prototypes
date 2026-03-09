import {
    useListUserPhoneStatuses,
    usePhoneStatusBatchPollingInterval,
} from '@repo/agent-status'
import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'

import { usePerformancePageAgentPhoneStatuses } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentPhoneStatuses'
import useAppSelector from 'hooks/useAppSelector'
import * as selectors from 'state/entities/stats/selectors'
import type { RootState } from 'state/types'

jest.mock('@repo/agent-status', () => ({
    useListUserPhoneStatuses: jest.fn(),
    usePhoneStatusBatchPollingInterval: jest.fn(),
}))

jest.mock('hooks/useAppSelector')

jest.mock('state/entities/stats/selectors', () => ({
    getUserIdsFromLiveAgentsPerformance: jest.fn(),
}))

const useAppSelectorMock = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const useListUserPhoneStatusesMock = assumeMock(useListUserPhoneStatuses)
const usePhoneStatusBatchPollingIntervalMock = assumeMock(
    usePhoneStatusBatchPollingInterval,
)
const getUserIdsFromLiveAgentsPerformanceMock = assumeMock(
    selectors.getUserIdsFromLiveAgentsPerformance,
)

describe('usePerformancePageAgentPhoneStatuses', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useAppSelectorMock.mockImplementation((selector) =>
            selector({ entities: { stats: {} } } as RootState),
        )
        useListUserPhoneStatusesMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        })
        usePhoneStatusBatchPollingIntervalMock.mockReturnValue(30000)
    })

    it('should extract user IDs from selector and call useListUserPhoneStatuses when enabled', () => {
        getUserIdsFromLiveAgentsPerformanceMock.mockReturnValue([1, 2, 3])

        renderHook(() =>
            usePerformancePageAgentPhoneStatuses({ enabled: true }),
        )

        expect(useListUserPhoneStatusesMock).toHaveBeenCalledWith({
            userIds: [1, 2, 3],
            enabled: true,
            refetchInterval: 30000,
        })
    })

    it('should call useListUserPhoneStatuses with enabled=false when disabled', () => {
        getUserIdsFromLiveAgentsPerformanceMock.mockReturnValue([1, 2, 3])

        renderHook(() =>
            usePerformancePageAgentPhoneStatuses({ enabled: false }),
        )

        expect(useListUserPhoneStatusesMock).toHaveBeenCalledWith({
            userIds: [1, 2, 3],
            enabled: false,
            refetchInterval: 30000,
        })
    })
})
