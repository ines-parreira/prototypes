import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    supportInteractionsPerIntentQueryFactory,
    supportInteractionsTotalQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/supportInteractionsMetrics'
import {
    AI_INTENTS_TO_EXCLUDE,
    AI_OUTCOME_TO_EXCLUDE,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'

describe('supportInteractionsMetrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-31T00:00:00Z',
        },
    }
    const outcomeCustomFieldId = 123
    const intentCustomFieldId = 456

    describe('supportInteractionsTotalQueryFactory', () => {
        it('should return a query with correct measures and no dimensions', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.measures).toEqual([
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ])
            expect(result.dimensions).toEqual([])
        })

        it('should return a query with correct metric name', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SUPPORT_INTERACTIONS_TOTAL,
            )
        })

        it('should include NotSpamNorTrashedTicketsFilter', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            NotSpamNorTrashedTicketsFilter.forEach((filter) => {
                expect(result.filters).toContainEqual(filter)
            })
        })

        it('should include date range filter', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            })
        })

        it('should include custom field exclusion filter for outcome', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${outcomeCustomFieldId}::${AI_OUTCOME_TO_EXCLUDE}`],
            })
        })

        it('should include custom field starts with filter for outcome', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeCustomFieldId}::`],
            })
        })

        it('should include intent custom field id filter', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            })
        })

        it('should include intent exclusion filter', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: AI_INTENTS_TO_EXCLUDE,
            })
        })

        it('should include timezone', () => {
            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.timezone).toBe(timezone)
        })

        it('should work with different custom field ids', () => {
            const customOutcome = 999
            const customIntent = 888

            const result = supportInteractionsTotalQueryFactory(
                filters,
                timezone,
                customOutcome,
                customIntent,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${customOutcome}::${AI_OUTCOME_TO_EXCLUDE}`],
            })
            expect(result.filters).toContainEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${customOutcome}::`],
            })
            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(customIntent)],
            })
        })

        it('should work with different timezones', () => {
            const differentTimezone = 'America/New_York'

            const result = supportInteractionsTotalQueryFactory(
                filters,
                differentTimezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.timezone).toBe(differentTimezone)
        })

        it('should format dates correctly', () => {
            const customFilters = {
                period: {
                    start_datetime: '2023-06-15T12:30:00Z',
                    end_datetime: '2023-07-15T18:45:00Z',
                },
            }

            const result = supportInteractionsTotalQueryFactory(
                customFilters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(
                        customFilters.period.start_datetime,
                    ),
                    formatReportingQueryDate(customFilters.period.end_datetime),
                ],
            })
        })
    })

    describe('supportInteractionsPerIntentQueryFactory', () => {
        it('should return a query with correct measures and dimension', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.measures).toEqual([
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ])
            expect(result.dimensions).toEqual([
                TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue,
            ])
        })

        it('should return a query with correct metric name', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_TOTAL_INTERACTIONS_PER_INTENT,
            )
        })

        it('should include NotSpamNorTrashedTicketsFilter', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            NotSpamNorTrashedTicketsFilter.forEach((filter) => {
                expect(result.filters).toContainEqual(filter)
            })
        })

        it('should include date range filter', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            })
        })

        it('should include custom field exclusion filter for outcome', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${outcomeCustomFieldId}::${AI_OUTCOME_TO_EXCLUDE}`],
            })
        })

        it('should include custom field starts with filter for outcome', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeCustomFieldId}::`],
            })
        })

        it('should include intent custom field id filter', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            })
        })

        it('should include intent exclusion filter', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: AI_INTENTS_TO_EXCLUDE,
            })
        })

        it('should include timezone', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.timezone).toBe(timezone)
        })

        it('should work with different custom field ids', () => {
            const customOutcome = 999
            const customIntent = 888

            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                customOutcome,
                customIntent,
            )

            expect(result.filters).toContainEqual({
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${customOutcome}::${AI_OUTCOME_TO_EXCLUDE}`],
            })
            expect(result.filters).toContainEqual({
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${customOutcome}::`],
            })
            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(customIntent)],
            })
        })

        it('should return the full expected query structure', () => {
            const result = supportInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result).toEqual({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue,
                ],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMember.CreatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(
                                filters.period.start_datetime,
                            ),
                            formatReportingQueryDate(
                                filters.period.end_datetime,
                            ),
                        ],
                    },
                    {
                        member: TicketMember.CustomFieldToExclude,
                        operator: ReportingFilterOperator.NotEquals,
                        values: [
                            `${outcomeCustomFieldId}::${AI_OUTCOME_TO_EXCLUDE}`,
                        ],
                    },
                    {
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [`${outcomeCustomFieldId}::`],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(intentCustomFieldId)],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                        operator: ReportingFilterOperator.NotEquals,
                        values: AI_INTENTS_TO_EXCLUDE,
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.AI_AGENT_TOTAL_INTERACTIONS_PER_INTENT,
            })
        })
    })
})
