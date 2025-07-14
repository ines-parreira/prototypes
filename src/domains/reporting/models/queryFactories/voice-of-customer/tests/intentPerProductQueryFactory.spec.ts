import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { ticketCountPerProductAndIntentQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/intentPerProductQueryFactory'
import { ticketsWithProductsQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('intentPerProductQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const customFieldId = '123'
    const sorting = OrderDirection.Desc

    it('should produce the query with the correct structure', () => {
        const query = ticketCountPerProductAndIntentQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
        )

        expect(query).toEqual({
            ...ticketsWithProductsQueryFactory(statsFilters, timezone, sorting),
            dimensions: [
                TicketProductsEnrichedDimension.ProductId,
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
            ],
            timezone,
            segments: [],
            filters: [
                ...ticketsWithProductsQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ).filters,
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: [customFieldId],
                },
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(
                            statsFilters.period.start_datetime,
                        ),
                        formatReportingQueryDate(
                            statsFilters.period.end_datetime,
                        ),
                    ],
                },
            ],
            order: [
                [
                    TicketProductsEnrichedMeasure.TicketCount,
                    OrderDirection.Desc,
                ],
            ],
        })
    })

    it('should produce the query with the provided sorting', () => {
        const customSorting = OrderDirection.Asc
        const query = ticketCountPerProductAndIntentQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            customSorting,
        )

        expect(query.order).toEqual([
            [TicketProductsEnrichedMeasure.TicketCount, OrderDirection.Desc],
        ])
    })

    it('should use default descending sorting when sorting is not provided', () => {
        const query = ticketCountPerProductAndIntentQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
        )

        expect(query.order).toEqual([
            [TicketProductsEnrichedMeasure.TicketCount, OrderDirection.Desc],
        ])
    })
})
