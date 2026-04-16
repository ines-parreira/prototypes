import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend,
    useAiAgentAllAgentsDecreaseInResolutionTimeTrend,
} from 'domains/reporting/hooks/automate/useAiAgentAllAgentsDecreaseInResolutionTimeTrend'
import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/useStatsMetric')

const useStatsMetricMock = assumeMock(useStatsMetric)
const fetchStatsMetricMock = assumeMock(fetchStatsMetric)

const defaultMetric = {
    isFetching: false,
    isError: false,
    data: undefined,
}

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-09-03T00:00:00.000',
        end_datetime: '2025-09-03T23:59:59.000',
    },
}
const timezone = 'UTC'

describe('useAiAgentAllAgentsDecreaseInResolutionTimeTrend', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useStatsMetricMock.mockReturnValue(defaultMetric)
    })

    it('builds a query with averageDecreaseInResolutionTime measure for the current period', () => {
        renderHook(() =>
            useAiAgentAllAgentsDecreaseInResolutionTimeTrend(filters, timezone),
        )

        const currentPeriodQuery = useStatsMetricMock.mock.calls[0][0]
        expect(currentPeriodQuery.measures).toEqual([
            'averageDecreaseInResolutionTime',
        ])
    })

    it('does not apply an aiAgentRole filter', () => {
        renderHook(() =>
            useAiAgentAllAgentsDecreaseInResolutionTimeTrend(filters, timezone),
        )

        const currentPeriodQuery = useStatsMetricMock.mock.calls[0][0]
        expect(currentPeriodQuery.filters).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ member: 'aiAgentRole' }),
            ]),
        )
    })

    it('builds a query with previous period filters', () => {
        renderHook(() =>
            useAiAgentAllAgentsDecreaseInResolutionTimeTrend(filters, timezone),
        )

        const prevPeriodQuery = useStatsMetricMock.mock.calls[1][0]
        expect(prevPeriodQuery.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ member: 'periodStart' }),
            ]),
        )
    })
})

describe('fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        fetchStatsMetricMock.mockResolvedValue(defaultMetric)
    })

    it('builds a query with averageDecreaseInResolutionTime measure for the current period', async () => {
        await fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend(
            filters,
            timezone,
        )

        const currentPeriodQuery = fetchStatsMetricMock.mock.calls[0][0]
        expect(currentPeriodQuery.measures).toEqual([
            'averageDecreaseInResolutionTime',
        ])
    })

    it('does not apply an aiAgentRole filter', async () => {
        await fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend(
            filters,
            timezone,
        )

        const currentPeriodQuery = fetchStatsMetricMock.mock.calls[0][0]
        expect(currentPeriodQuery.filters).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ member: 'aiAgentRole' }),
            ]),
        )
    })

    it('builds a query with previous period filters', async () => {
        await fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend(
            filters,
            timezone,
        )

        const prevPeriodQuery = fetchStatsMetricMock.mock.calls[1][0]
        expect(prevPeriodQuery.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ member: 'periodStart' }),
            ]),
        )
    })
})
