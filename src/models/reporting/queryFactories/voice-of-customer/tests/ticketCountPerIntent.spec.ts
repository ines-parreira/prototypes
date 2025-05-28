import moment from 'moment'

import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    ticketCountPerIntentDrillDownQueryFactory,
    ticketCountPerIntentQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'utils/reporting'

describe('ticketCountPerIntentQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const intent = 'test-intent'
    const sorting = OrderDirection.Desc

    it('should produce the query', () => {
        const query = ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intent,
        )

        expect(query).toEqual({
            measures: [TicketProductsEnrichedMeasure.TicketCount],
            dimensions: [
                TicketProductsEnrichedDimension.ProductId,
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
            ],
            timezone,
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketMessagesEnrichedFirstResponseTimesMembers,
                    statsFilters,
                ),
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: [intent],
                },

                {
                    member: TicketProductsEnrichedDimension.DeletedDatetime,
                    operator: ReportingFilterOperator.Equals,
                    values: [null],
                },
            ],
        })
    })

    it('should produce the query with sorting', () => {
        const query = ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intent,
            sorting,
        )

        expect(query).toEqual({
            measures: [TicketProductsEnrichedMeasure.TicketCount],
            dimensions: [
                TicketProductsEnrichedDimension.ProductId,
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
            ],
            timezone,
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketMessagesEnrichedFirstResponseTimesMembers,
                    statsFilters,
                ),
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: [intent],
                },

                {
                    member: TicketProductsEnrichedDimension.DeletedDatetime,
                    operator: ReportingFilterOperator.Equals,
                    values: [null],
                },
            ],
            order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
        })
    })
})

describe('ticketCountPerIntentDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const intent = 'test-intent'
    const sorting = OrderDirection.Desc

    it('should produce the query', () => {
        const query = ticketCountPerIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intent,
        )

        expect(query).toEqual({
            ...ticketCountPerIntentQueryFactory(statsFilters, timezone, intent),
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should produce the query with sorting', () => {
        const query = ticketCountPerIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intent,
            sorting,
        )

        expect(query).toEqual({
            ...ticketCountPerIntentQueryFactory(
                statsFilters,
                timezone,
                intent,
                sorting,
            ),
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })
})
