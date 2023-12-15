import moment from 'moment'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {ReportingFilterOperator} from 'models/reporting/types'
import {
    VoiceCallSegment,
    VoiceCallMember,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import {voiceCallCountQueryFactory} from '../voiceCall'

describe('voice call queries factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe.each([
        [
            'voiceCallQueryFactory',
            [VoiceCallMeasure.VoiceCallCount],
            [],
            undefined,
            voiceCallCountQueryFactory,
        ],
        [
            'voiceCallQueryFactory',
            [VoiceCallMeasure.VoiceCallCount],
            [],
            VoiceCallSegment.outboundCalls,
            voiceCallCountQueryFactory,
        ],
    ])('%s', (_testName, measures, dimensions, segment, getFactory) => {
        it('should create a query', () => {
            const query = getFactory(statsFilters, timezone, segment)

            expect(query).toEqual({
                measures,
                dimensions,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
                timezone,
                segments: segment ? [segment] : [],
            })
        })
    })
})
