import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend,
    useAiAgentSupportAgentDecreaseInResolutionTimeTrend,
} from 'domains/reporting/hooks/automate/useAiAgentSupportAgentDecreaseInResolutionTimeTrend'
import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

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

describe('useAiAgentSupportAgentDecreaseInResolutionTimeTrend', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useStatsMetricMock.mockReturnValue(defaultMetric)
    })

    it('builds a query with aiAgentRole hardcoded to ai-agent-support for the current period', () => {
        renderHook(() =>
            useAiAgentSupportAgentDecreaseInResolutionTimeTrend(
                filters,
                timezone,
            ),
        )

        const currentPeriodQuery = useStatsMetricMock.mock.calls[0][0]
        expect(currentPeriodQuery.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['ai-agent-support'],
                }),
            ]),
        )
    })

    it('builds a query with aiAgentRole hardcoded to ai-agent-support for the previous period', () => {
        renderHook(() =>
            useAiAgentSupportAgentDecreaseInResolutionTimeTrend(
                filters,
                timezone,
            ),
        )

        const prevPeriodQuery = useStatsMetricMock.mock.calls[1][0]
        expect(prevPeriodQuery.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['ai-agent-support'],
                }),
            ]),
        )
        expect(prevPeriodQuery.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ member: 'periodStart' }),
            ]),
        )
    })
})

describe('fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        fetchStatsMetricMock.mockResolvedValue(defaultMetric)
    })

    it('builds a query with aiAgentRole hardcoded to ai-agent-support for the current period', async () => {
        await fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend(
            filters,
            timezone,
        )

        const currentPeriodQuery = fetchStatsMetricMock.mock.calls[0][0]
        expect(currentPeriodQuery.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['ai-agent-support'],
                }),
            ]),
        )
    })

    it('builds a query with previous period filters', async () => {
        await fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend(
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
