import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    getCustomFieldValueSerializer,
    TICKET_CUSTOM_FIELDS_API_SEPARATOR,
} from 'domains/reporting/models/queryFactories/utils'
import {
    returnMentionsPerProductDrillDownQueryFactory,
    returnMentionsPerProductQueryFactory,
} from 'domains/reporting/models/queryFactories/voice-of-customer/returnMentionsPerProduct'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('return mentions per product', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const intentCustomFieldId = 123
    const sorting = OrderDirection.Desc
    const RETURN_MENTION_L1_INTENT = 'Return'

    describe('returnMentionsPerProductQueryFactory', () => {
        it('should produce the query without sorting', () => {
            const query = returnMentionsPerProductQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
            )

            expect(query).toEqual({
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_RETURN_MENTIONS_PER_PRODUCT,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [
                    TicketProductsEnrichedDimension.ProductId,
                    TicketProductsEnrichedDimension.StoreId,
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
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [
                            getCustomFieldValueSerializer(intentCustomFieldId)(
                                `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                            ),
                        ],
                    },
                ],
            })
        })

        it('should produce the query with sorting', () => {
            const query = returnMentionsPerProductQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                sorting,
            )

            expect(query).toEqual({
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_RETURN_MENTIONS_PER_PRODUCT,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [
                    TicketProductsEnrichedDimension.ProductId,
                    TicketProductsEnrichedDimension.StoreId,
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
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [
                            getCustomFieldValueSerializer(intentCustomFieldId)(
                                `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                            ),
                        ],
                    },
                ],
                order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
            })
        })

        it('should use the provided intentCustomFieldId in the filter', () => {
            const query = returnMentionsPerProductQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
            )

            const customFieldIdFilter = query.filters.find(
                (filter) =>
                    typeof filter === 'object' &&
                    filter.member === TicketMember.CustomField,
            )

            expect(customFieldIdFilter).toEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [
                    getCustomFieldValueSerializer(intentCustomFieldId)(
                        `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                    ),
                ],
            })
        })

        it('should filter for "Return" mentions', () => {
            const query = returnMentionsPerProductQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
            )

            const returnMentionFilter = query.filters.find(
                (filter) =>
                    typeof filter === 'object' &&
                    filter.member === TicketMember.CustomField,
            )

            expect(returnMentionFilter).toEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [
                    getCustomFieldValueSerializer(intentCustomFieldId)(
                        `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                    ),
                ],
            })
        })
    })

    describe('returnMentionsPerProductDrillDownQueryFactory', () => {
        const productId = 'some-product-id'

        it('should produce the query without sorting', () => {
            const query = returnMentionsPerProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                productId,
            )

            expect(query).toEqual({
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_RETURN_MENTIONS_PER_PRODUCT_DRILL_DOWN,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [TicketDimension.TicketId],
                timezone,
                segments: [],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketMessagesEnrichedFirstResponseTimesMembers,
                        statsFilters,
                    ),
                    {
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [
                            getCustomFieldValueSerializer(intentCustomFieldId)(
                                `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                            ),
                        ],
                    },
                    {
                        member: TicketProductsEnrichedDimension.ProductId,
                        operator: ReportingFilterOperator.Equals,
                        values: [productId],
                    },
                ],
            })
        })

        it('should produce the query with sorting', () => {
            const query = returnMentionsPerProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                productId,
                sorting,
            )

            expect(query).toEqual({
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_RETURN_MENTIONS_PER_PRODUCT_DRILL_DOWN,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [TicketDimension.TicketId],
                timezone,
                segments: [],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketMessagesEnrichedFirstResponseTimesMembers,
                        statsFilters,
                    ),
                    {
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [
                            getCustomFieldValueSerializer(intentCustomFieldId)(
                                `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                            ),
                        ],
                    },
                    {
                        member: TicketProductsEnrichedDimension.ProductId,
                        operator: ReportingFilterOperator.Equals,
                        values: [productId],
                    },
                ],
                order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
            })
        })

        it('should use the provided intentCustomFieldId in the filter', () => {
            const query = returnMentionsPerProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                productId,
            )

            const customFieldIdFilter = query.filters.find(
                (filter) =>
                    typeof filter === 'object' &&
                    filter.member === TicketMember.CustomField,
            )

            expect(customFieldIdFilter).toEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [
                    getCustomFieldValueSerializer(intentCustomFieldId)(
                        `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                    ),
                ],
            })
        })

        it('should filter for "Return" mentions', () => {
            const query = returnMentionsPerProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                productId,
            )

            const returnMentionFilter = query.filters.find(
                (filter) =>
                    typeof filter === 'object' &&
                    filter.member === TicketMember.CustomField,
            )

            expect(returnMentionFilter).toEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [
                    getCustomFieldValueSerializer(intentCustomFieldId)(
                        `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                    ),
                ],
            })
        })
    })
})
