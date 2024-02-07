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
})
