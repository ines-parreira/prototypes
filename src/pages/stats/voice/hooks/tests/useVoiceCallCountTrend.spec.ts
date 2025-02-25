import moment from 'moment/moment'

import { fetchMetricTrend } from 'hooks/reporting/useMetricTrend'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import {
    fetchVoiceCallCountInboundTrend,
    fetchVoiceCallCountMissedTrend,
    fetchVoiceCallCountOutboundTrend,
    fetchVoiceCallCountTrend,
} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('VoiceCallCountTrend', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(periodStart),
            start_datetime: formatReportingQueryDate(periodEnd),
        },
    }
    const userTimezone = 'UTC'

    it.each([
        {
            fetch: fetchVoiceCallCountTrend,
            segment: undefined,
        },
        {
            fetch: fetchVoiceCallCountOutboundTrend,
            segment: VoiceCallSegment.outboundCalls,
        },
        {
            fetch: fetchVoiceCallCountInboundTrend,
            segment: VoiceCallSegment.inboundCalls,
        },
        {
            fetch: fetchVoiceCallCountMissedTrend,
            segment: VoiceCallSegment.missedCalls,
        },
    ])(
        'should use voiceCallCountQueryFactory with specific segment ($segment)',
        async ({ fetch, segment }) => {
            await fetch(statsFilters, userTimezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                voiceCallCountQueryFactory(statsFilters, userTimezone, segment),
                voiceCallCountQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    userTimezone,
                    segment,
                ),
            )
        },
    )
})
