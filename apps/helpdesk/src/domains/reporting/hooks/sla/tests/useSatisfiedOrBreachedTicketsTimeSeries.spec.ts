import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchSatisfiedOrBreachedTicketsTimeSeries,
    useSatisfiedOrBreachedTicketsTimeSeries,
} from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { satisfiedOrBreachedTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import { satisfiedOrBreachedTicketsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/ticketSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useTimeSeries')
const useTimeSeriesPerDimensionMock = assumeMock(useTimeSeriesPerDimension)
const fetchTimeSeriesPerDimensionMock = assumeMock(fetchTimeSeriesPerDimension)

describe('satisfiedOrBreachedTicketsTimeSeries', () => {
    describe('useSatisfiedOrBreachedTicketsTimeSeries', () => {
        const startDate = '2021-05-01T00:00:00+02:00'
        const endDate = '2021-05-04T23:59:59+02:00'
        const filters: StatsFilters = {
            period: {
                start_datetime: startDate,
                end_datetime: endDate,
            },
        }
        const timeZone = 'UTC'
        const granularity = ReportingGranularity.Day

        it('should call a queryFactory', () => {
            renderHook(() =>
                useSatisfiedOrBreachedTicketsTimeSeries(
                    filters,
                    timeZone,
                    granularity,
                ),
            )

            expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
                    filters,
                    timeZone,
                    granularity,
                ),
                satisfiedOrBreachedTicketsTimeseriesQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    granularity,
                }),
            )
        })
    })

    describe('fetchSatisfiedOrBreachedTicketsTimeSeries', () => {
        const startDate = '2021-05-01T00:00:00+02:00'
        const endDate = '2021-05-04T23:59:59+02:00'
        const filters: StatsFilters = {
            period: {
                start_datetime: startDate,
                end_datetime: endDate,
            },
        }
        const timeZone = 'UTC'
        const granularity = ReportingGranularity.Day

        it('should call a queryFactory', async () => {
            await fetchSatisfiedOrBreachedTicketsTimeSeries(
                filters,
                timeZone,
                granularity,
            )

            expect(fetchTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
                satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
                    filters,
                    timeZone,
                    granularity,
                ),
                satisfiedOrBreachedTicketsTimeseriesQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    granularity,
                }),
            )
        })
    })
})
