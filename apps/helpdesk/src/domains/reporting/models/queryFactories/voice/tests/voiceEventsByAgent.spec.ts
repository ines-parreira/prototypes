import moment from 'moment'

import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentMember,
    VoiceEventsByAgentSegment,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    declinedVoiceCallsCountPerAgentQueryFactory,
    declinedVoiceCallsCountQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('voice events by agent factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    it('declinedVoiceCallsCountPerAgentQueryFactory should create a query', () => {
        const query = declinedVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            'UTC',
        )

        expect(query).toEqual({
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [VoiceEventsByAgentDimension.AgentId],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
        })
    })

    it('declinedVoiceCallsCountPerAgentQueryFactory should create a query with sorting', () => {
        const query = declinedVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            'UTC',
            OrderDirection.Asc,
        )

        expect(query).toEqual({
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [VoiceEventsByAgentDimension.AgentId],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
            order: [
                [
                    VoiceEventsByAgentMeasure.VoiceEventsCount,
                    OrderDirection.Asc,
                ],
            ],
        })
    })

    it('declinedVoiceCallsCountQueryFactory should create a query', () => {
        const query = declinedVoiceCallsCountQueryFactory(statsFilters, 'UTC')

        expect(query).toEqual({
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
        })
    })

    it.each([
        declinedVoiceCallsCountPerAgentQueryFactory,
        declinedVoiceCallsCountQueryFactory,
    ])(
        'should append ticket period filters when requesting tags',
        (factory) => {
            const statsFilters: StatsFilters = {
                period: {
                    end_datetime: periodEnd,
                    start_datetime: periodStart,
                },
                tags: [
                    {
                        ...withDefaultLogicalOperator([1, 2]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            }
            const query = factory(statsFilters, 'UTC')
            expect(query.filters).toEqual(
                expect.arrayContaining([
                    {
                        member: VoiceEventsByAgentMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceEventsByAgentMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1', '2'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ]),
            )
        },
    )
})
