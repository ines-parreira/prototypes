import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchDecreaseInFirstResponseTimeTrend,
    useDecreaseInFirstResponseTimeTrend,
} from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentAllAgentsFRTTrend,
    useAiAgentAllAgentsFRTTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsFRTTrend'

jest.mock(
    'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend',
)
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')

const useDecreaseInFirstResponseTimeTrendMock = assumeMock(
    useDecreaseInFirstResponseTimeTrend,
)
const fetchDecreaseInFirstResponseTimeTrendMock = assumeMock(
    fetchDecreaseInFirstResponseTimeTrend,
)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'
const aiAgentUserId = 42

describe('useAiAgentAllAgentsFRTTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useAiAgentAllAgentsFRTTrend', () => {
        it('should call useDecreaseInFirstResponseTimeTrend with agent-filtered filters when aiAgentUserId is defined', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            renderHook(() =>
                useAiAgentAllAgentsFRTTrend(statsFilters, timezone),
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([aiAgentUserId]),
            }

            expect(
                useDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(filteredFilters, timezone)
        })

        it('should call useDecreaseInFirstResponseTimeTrend with empty agents filter when aiAgentUserId is undefined', () => {
            useAIAgentUserIdMock.mockReturnValue(undefined)
            renderHook(() =>
                useAiAgentAllAgentsFRTTrend(statsFilters, timezone),
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([]),
            }

            expect(
                useDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(filteredFilters, timezone)
        })

        it('should return the result from useDecreaseInFirstResponseTimeTrend', () => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            const mockTrendResult = {
                data: { value: 3600, prevValue: 4200 },
                isFetching: false,
                isError: false,
            }
            useDecreaseInFirstResponseTimeTrendMock.mockReturnValue(
                mockTrendResult,
            )

            const { result } = renderHook(() =>
                useAiAgentAllAgentsFRTTrend(statsFilters, timezone),
            )

            expect(result.current).toBe(mockTrendResult)
        })
    })

    describe('fetchAiAgentAllAgentsFRTTrend', () => {
        it('should call fetchDecreaseInFirstResponseTimeTrend with agent-filtered filters when aiAgentUserId is defined', async () => {
            await fetchAiAgentAllAgentsFRTTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([aiAgentUserId]),
            }

            expect(
                fetchDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(filteredFilters, timezone, aiAgentUserId)
        })

        it('should call fetchDecreaseInFirstResponseTimeTrend with empty agents filter when aiAgentUserId is undefined', async () => {
            await fetchAiAgentAllAgentsFRTTrend(
                statsFilters,
                timezone,
                undefined,
            )

            const filteredFilters = {
                ...statsFilters,
                [FilterKey.Agents]: withDefaultLogicalOperator([]),
            }

            expect(
                fetchDecreaseInFirstResponseTimeTrendMock,
            ).toHaveBeenCalledWith(filteredFilters, timezone, undefined)
        })

        it('should return the result from fetchDecreaseInFirstResponseTimeTrend', async () => {
            const mockTrendResult = {
                data: { value: 3600, prevValue: 4200 },
                isFetching: false,
                isError: false,
            }
            fetchDecreaseInFirstResponseTimeTrendMock.mockResolvedValue(
                mockTrendResult,
            )

            const result = await fetchAiAgentAllAgentsFRTTrend(
                statsFilters,
                timezone,
                aiAgentUserId,
            )

            expect(result).toBe(mockTrendResult)
        })
    })
})
