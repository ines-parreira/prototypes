import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchSatisfiedOrBreachedVoiceCallsTimeSeries,
    useSatisfiedOrBreachedVoiceCallsTimeSeries,
} from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import {
    fetchStatsTimeSeries,
    useStatsTimeSeries,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import { satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/voiceSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useStatsTimeSeries')
const useStatsTimeSeriesMock = assumeMock(useStatsTimeSeries)
const fetchStatsTimeSeriesMock = assumeMock(fetchStatsTimeSeries)

describe('satisfiedOrBreachedVoiceCallsTimeSeries', () => {
    describe('useSatisfiedOrBreachedVoiceCallsTimeSeries', () => {
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

        it('should call useStatsTimeSeries with correct query factory', () => {
            renderHook(() =>
                useSatisfiedOrBreachedVoiceCallsTimeSeries(
                    filters,
                    timeZone,
                    granularity,
                ),
            )

            expect(useStatsTimeSeriesMock).toHaveBeenCalledWith(
                satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    granularity,
                }),
            )
        })
    })

    describe('fetchSatisfiedOrBreachedVoiceCallsTimeSeries', () => {
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

        it('should call fetchStatsTimeSeries with correct query factory', async () => {
            await fetchSatisfiedOrBreachedVoiceCallsTimeSeries(
                filters,
                timeZone,
                granularity,
            )

            expect(fetchStatsTimeSeriesMock).toHaveBeenCalledWith(
                satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    granularity,
                }),
            )
        })
    })
})
