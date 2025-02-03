import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchReviewedClosedTicketsPerAgent,
    useReviewedClosedTicketsPerAgent,
} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {reviewedClosedTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('ReviewedClosedTicketsPerAgent', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const agentId = '123'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    useMetricPerDimensionMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any
    )

    describe('useReviewedClosedTicketsPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useReviewedClosedTicketsPerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId
                )
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                reviewedClosedTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined
                ),
                agentId
            )
        })
    })

    describe('fetchReviewedClosedTicketsPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchReviewedClosedTicketsPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                reviewedClosedTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined
                ),
                agentId
            )
        })
    })
})
