import moment from 'moment'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {ReportingFilterOperator} from 'models/reporting/types'
import {
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentMember,
    VoiceEventsByAgentSegment,
    VoiceEventsByAgentDimension,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import {TicketMember} from 'models/reporting/cubes/TicketCube'

import {
    declinedVoiceCallsCountPerAgentQueryFactory,
    declinedVoiceCallsCountQueryFactory,
} from '../voiceEventsByAgent'

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
            'UTC'
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
            segments: [VoiceEventsByAgentSegment.declinedCalls],
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
            segments: [VoiceEventsByAgentSegment.declinedCalls],
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
                tags: [1, 2],
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
                ])
            )
        }
    )
})
