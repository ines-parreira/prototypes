import { assumeMock } from '@repo/testing'
import moment from 'moment'

import { fetchMetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchVoiceCallAverageTimeTalkTimeTrend,
    fetchVoiceCallAverageTimeWaitTimeTrend,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('useVoiceCallAverageTimeTrend', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(periodStart),
            start_datetime: formatReportingQueryDate(periodEnd),
        },
    }
    const userTimezone = 'UTC'

    describe('fetchVoiceCallAverageTimeWaitTimeTrend', () => {
        it('should use voiceCallAverageWaitTimeQueryFactory', async () => {
            await fetchVoiceCallAverageTimeWaitTimeTrend(
                statsFilters,
                userTimezone,
            )

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallAverageWaitTimeQueryFactory(
                    statsFilters,
                    userTimezone,
                ),
                voiceCallAverageWaitTimeQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone,
                ),
            )
        })
    })

    describe('fetchVoiceCallAverageTimeTalkTimeTrend', () => {
        it('should use voiceCallAverageWaitTimeQueryFactory', async () => {
            await fetchVoiceCallAverageTimeTalkTimeTrend(
                statsFilters,
                userTimezone,
            )

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallAverageTalkTimeQueryFactory(
                    statsFilters,
                    userTimezone,
                ),
                voiceCallAverageTalkTimeQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone,
                ),
            )
        })
    })
})
