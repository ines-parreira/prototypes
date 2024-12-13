import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsDimension} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {
    NotSpamNorTrashedTicketsFilter,
    formatReportingQueryDate,
} from 'utils/reporting'

import {customerSatisfactionPerCustomFieldQueryFactory} from '../metrics'

describe('AI Agent metrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }

    it('customerSatisfactionPerCustomFieldQueryFactory', () => {
        expect(
            customerSatisfactionPerCustomFieldQueryFactory(filters, timezone)
        ).toEqual({
            dimensions: [
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
            ],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                    ],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
            ],
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            timezone: timezone,
        })
    })
})
