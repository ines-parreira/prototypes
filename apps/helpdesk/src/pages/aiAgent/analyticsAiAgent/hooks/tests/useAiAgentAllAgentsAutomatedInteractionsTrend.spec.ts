import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentAllAgentsAutomatedInteractionsTrend,
    useAiAgentAllAgentsAutomatedInteractionsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomatedInteractionsTrend'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2021-05-29T00:00:00.000',
        end_datetime: '2021-06-04T23:59:59.000',
    },
}
const userTimezone = 'UTC'

const mockTrend = {
    data: { value: 12, prevValue: 9 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentAllAgentsAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    const renderHookUnderTest = () =>
        renderHook(() => useAiAgentAllAgentsAutomatedInteractionsTrend())

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderHookUnderTest()

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: statsFilters,
                timezone: userTimezone,
            }),
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            }),
        )
    })

    it('should return trend data with label', () => {
        const { result } = renderHookUnderTest()

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 12,
                prevValue: 9,
            },
        })
    })

    it('should return null values when data is undefined', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHookUnderTest()

        expect(result.current.data).toEqual({
            label: 'Automated interactions',
            value: null,
            prevValue: null,
        })
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderHookUnderTest()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderHookUnderTest()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAiAgentAllAgentsAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
            statsFilters,
            userTimezone,
        )

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: statsFilters,
                timezone: userTimezone,
            }),
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            }),
        )
    })

    it('should return the trend result', async () => {
        const result = await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
            statsFilters,
            userTimezone,
        )

        expect(result).toEqual(mockTrend)
    })
})
