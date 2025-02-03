import moment from 'moment'

import {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {StatsFilters} from 'models/stat/types'
import {
    fetchVoiceCallAverageTimeTalkTimeTrend,
    fetchVoiceCallAverageTimeWaitTimeTrend,
} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
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
                userTimezone
            )

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallAverageWaitTimeQueryFactory(
                    statsFilters,
                    userTimezone
                ),
                voiceCallAverageWaitTimeQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone
                )
            )
        })
    })

    describe('fetchVoiceCallAverageTimeTalkTimeTrend', () => {
        it('should use voiceCallAverageWaitTimeQueryFactory', async () => {
            await fetchVoiceCallAverageTimeTalkTimeTrend(
                statsFilters,
                userTimezone
            )

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallAverageTalkTimeQueryFactory(
                    statsFilters,
                    userTimezone
                ),
                voiceCallAverageTalkTimeQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone
                )
            )
        })
    })
})
