import moment from 'moment'

import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { TicketCustomFieldsMember } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { returnMentionsPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'utils/reporting'

describe('returnMentionsPerProductQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const intentsCustomFieldId = '123'
    const sorting = OrderDirection.Desc
    const RETURN_MENTION_L1_INTENT = 'Return'

    it('should produce the query without sorting', () => {
        const query = returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
        )

        expect(query).toEqual({
            measures: [TicketProductsEnrichedMeasure.TicketCount],
            dimensions: [TicketProductsEnrichedDimension.ProductId],
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
                    values: [intentsCustomFieldId],
                },
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [
                        `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                    ],
                },
            ],
        })
    })

    it('should produce the query with sorting', () => {
        const query = returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        )

        expect(query).toEqual({
            measures: [TicketProductsEnrichedMeasure.TicketCount],
            dimensions: [TicketProductsEnrichedDimension.ProductId],
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
                    values: [intentsCustomFieldId],
                },
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [
                        `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                    ],
                },
            ],
            order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
        })
    })

    it('should use the provided intentsCustomFieldId in the filter', () => {
        const customIntentsFieldId = '456'
        const query = returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            customIntentsFieldId,
        )

        const customFieldIdFilter = query.filters.find(
            (filter) =>
                typeof filter === 'object' &&
                filter.member ===
                    TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
        )

        expect(customFieldIdFilter).toEqual({
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [customIntentsFieldId],
        })
    })

    it('should filter for "Return" mentions', () => {
        const query = returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
        )

        const returnMentionFilter = query.filters.find(
            (filter) =>
                typeof filter === 'object' &&
                filter.member ===
                    TicketCustomFieldsMember.TicketCustomFieldsValueString,
        )

        expect(returnMentionFilter).toEqual({
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: [
                `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
            ],
        })
    })
})
