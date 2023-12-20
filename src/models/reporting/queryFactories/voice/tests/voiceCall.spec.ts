import moment from 'moment'
import {formatReportingQueryDate} from 'utils/reporting'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {ReportingFilterOperator} from 'models/reporting/types'
import {
    VoiceCallSegment,
    VoiceCallMember,
    VoiceCallMeasure,
    VoiceCallDimension,
} from 'models/reporting/cubes/VoiceCallCube'
import {
    voiceCallCountQueryFactory,
    voiceCallListQueryFactory,
} from '../voiceCall'

describe('voice queries factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it.each([
        [[VoiceCallMeasure.VoiceCallCount], [], undefined],
        [[VoiceCallMeasure.VoiceCallCount], [], VoiceCallSegment.outboundCalls],
    ])(
        'voiceCallQueryFactory should create a query',
        (measures, dimensions, segment) => {
            const query = voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                segment
            )

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
        }
    )

    it.each([
        [VoiceCallSegment.outboundCalls, 10, 0],
        [undefined, 10, 10],
    ])(
        'voiceCallListQueryFactory should create a query',
        (segment, limit, offset) => {
            const query = voiceCallListQueryFactory(
                statsFilters,
                timezone,
                segment,
                limit,
                offset
            )

            expect(query).toEqual({
                measures: [VoiceCallMeasure.VoiceCallCount],
                dimensions: [
                    VoiceCallDimension.AgentId,
                    VoiceCallDimension.CustomerId,
                    VoiceCallDimension.Direction,
                    VoiceCallDimension.IntegrationId,
                    VoiceCallDimension.CreatedAt,
                    VoiceCallDimension.Status,
                    VoiceCallDimension.Duration,
                    VoiceCallDimension.TicketId,
                    VoiceCallDimension.PhoneNumberSource,
                    VoiceCallDimension.PhoneNumberDestination,
                ],
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
                offset,
                limit,
                order: [[VoiceCallDimension.CreatedAt, OrderDirection.Desc]],
            })
        }
    )
})
