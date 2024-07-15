import moment from 'moment'
import {formatReportingQueryDate} from 'utils/reporting'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {ReportingFilterOperator} from 'models/reporting/types'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {MIN_DATE_FOR_ADVANCED_VOICE_STATS} from 'pages/stats/voice/constants/voiceOverview'
import {
    connectedCallsListQueryFactory,
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
    voiceCallCountPerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
    voiceCallCountQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from '../voiceCall'

const voiceCallListDimensions = [
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
    VoiceCallDimension.TalkTime,
    VoiceCallDimension.WaitTime,
    VoiceCallDimension.VoicemailAvailable,
    VoiceCallDimension.VoicemailUrl,
    VoiceCallDimension.CallRecordingAvailable,
    VoiceCallDimension.CallRecordingUrl,
]

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
                dimensions: voiceCallListDimensions,
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

    it('voiceCallTotalTalkTimeQueryFactory should create a query', () => {
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

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'voiceCallCountPerFilteringAgentQueryFactory should create a query',
        (segment) => {
            const query = voiceCallCountPerFilteringAgentQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: segment ? [segment] : [],
                timezone,
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
            })
        }
    )

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'voiceCallCountPerAgentQueryFactory should create a query',
        (segment) => {
            const query = voiceCallCountPerAgentQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: segment ? [segment] : [],
                timezone,
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
            })
        }
    )

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'voiceCallAverageTalkTimePerAgentQueryFactory should create a query',
        (segment) => {
            const query = voiceCallAverageTalkTimePerAgentQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
                segments: segment ? [segment] : [],
                timezone,
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
            })
        }
    )

    it('connectedCallsListQueryFactory should create a query', () => {
        const query = connectedCallsListQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: voiceCallListDimensions,
            timezone,
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
                {
                    member: VoiceCallMember.TalkTime,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
            ],
        })
    })

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'waitingTimeCallsListQueryFactory should create a query',
        (segment) => {
            const query = waitingTimeCallsListQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: voiceCallListDimensions,
                measures: [VoiceCallMeasure.VoiceCallCount],
                timezone,
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
                    {
                        member: VoiceCallMember.WaitTime,
                        operator: ReportingFilterOperator.Set,
                        values: [],
                    },
                ],
                segments: segment ? [segment] : [],
            })
        }
    )
})
