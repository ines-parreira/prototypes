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
import {MIN_DATE_FOR_ADVANCED_VOICE_STATS} from 'pages/stats/voice/constants/voiceOverview'
import {
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
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

    it('voiceCallAverageTalkTimeQueryFactory should create a query', () => {
        const query = voiceCallAverageTalkTimeQueryFactory(statsFilters, 'UTC')

        expect(query).toEqual({
            measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
            dimensions: [],
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
            timezone: 'UTC',
            segments: [],
        })
    })

    it('voiceCallAverageWaitTimeQueryFactory should create a query', () => {
        const query = voiceCallAverageWaitTimeQueryFactory(statsFilters, 'UTC')

        expect(query).toEqual({
            measures: [VoiceCallMeasure.VoiceCallAverageWaitTime],
            dimensions: [],
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
            timezone: 'UTC',
            segments: [VoiceCallSegment.inboundCalls],
        })
    })

    it.each([
        voiceCallAverageTalkTimeQueryFactory,
        voiceCallAverageWaitTimeQueryFactory,
    ])(
        'should limit period to after MIN_DATE_FOR_ADVANCED_VOICE_STATS',
        (factory) => {
            const periodStart = formatReportingQueryDate(moment('2023-12-01'))
            const periodEnd = formatReportingQueryDate(moment('2023-12-28'))
            const statsFilters: StatsFilters = {
                period: {
                    end_datetime: periodEnd,
                    start_datetime: periodStart,
                },
            }
            const query = factory(statsFilters, 'UTC')
            expect(query.filters).toEqual([
                {
                    member: VoiceCallMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)
                        ),
                    ],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(
                            moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)
                        ),
                    ],
                },
            ])
        }
    )
})
