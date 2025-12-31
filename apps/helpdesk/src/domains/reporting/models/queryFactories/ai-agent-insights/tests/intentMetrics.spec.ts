import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    handoverInteractionsPerIntentQueryFactory,
    snoozedInteractionsPerIntentQueryFactory,
    totalInteractionsPerIntentQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/intentMetrics'
import {
    AI_INTENTS_TO_EXCLUDE,
    AI_OUTCOME_TO_EXCLUDE,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'

describe('Intent Metrics Query Factories', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const outcomeCustomFieldId = 5254
    const intentCustomFieldId = 5253

    describe('handoverInteractionsPerIntentQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = handoverInteractionsPerIntentQueryFactory(
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
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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
                        values: [`${outcomeCustomFieldId}::Handover::`],
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
                metricName:
                    METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_INTENT,
            })
        })

        it('should include AI_INTENTS_TO_EXCLUDE in filters', () => {
            const result = handoverInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            const intentExcludeFilter = result.filters.find(
                (f) =>
                    f.member ===
                        TicketCustomFieldsMember.TicketCustomFieldsValueString &&
                    f.operator === ReportingFilterOperator.NotEquals,
            )

            expect(intentExcludeFilter).toBeDefined()
            expect(intentExcludeFilter?.values).toEqual(AI_INTENTS_TO_EXCLUDE)
        })
    })

    describe('snoozedInteractionsPerIntentQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = snoozedInteractionsPerIntentQueryFactory(
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
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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
                        values: [`${outcomeCustomFieldId}::Snooze::`],
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
                metricName:
                    METRIC_NAMES.AI_AGENT_SNOOZED_INTERACTIONS_PER_INTENT,
            })
        })

        it('should filter for Snooze outcome', () => {
            const result = snoozedInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            const snoozeFilter = result.filters.find(
                (f) =>
                    f.member === TicketMember.CustomField &&
                    f.operator === ReportingFilterOperator.StartsWith,
            )

            expect(snoozeFilter?.values).toEqual([
                `${outcomeCustomFieldId}::Snooze::`,
            ])
        })
    })

    describe('totalInteractionsPerIntentQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = totalInteractionsPerIntentQueryFactory(
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
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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

        it('should filter for all outcomes (not specific ones)', () => {
            const result = totalInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            const outcomeFilter = result.filters.find(
                (f) =>
                    f.member === TicketMember.CustomField &&
                    f.operator === ReportingFilterOperator.StartsWith,
            )

            expect(outcomeFilter?.values).toEqual([`${outcomeCustomFieldId}::`])
        })

        it('should include correct metric name', () => {
            const result = totalInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_TOTAL_INTERACTIONS_PER_INTENT,
            )
        })
    })

    describe('Common query structure', () => {
        it('all queries should include NotSpamNorTrashedTicketsFilter', () => {
            const handover = handoverInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const snoozed = snoozedInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const total = totalInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            ;[handover, snoozed, total].forEach((query) => {
                expect(query.filters).toEqual(
                    expect.arrayContaining(NotSpamNorTrashedTicketsFilter),
                )
            })
        })

        it('all queries should exclude AI_OUTCOME_TO_EXCLUDE', () => {
            const handover = handoverInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const snoozed = snoozedInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const total = totalInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            ;[handover, snoozed, total].forEach((query) => {
                const outcomeExcludeFilter = query.filters.find(
                    (f) =>
                        f.member === TicketMember.CustomFieldToExclude &&
                        f.operator === ReportingFilterOperator.NotEquals,
                )
                expect(outcomeExcludeFilter?.values).toContain(
                    `${outcomeCustomFieldId}::${AI_OUTCOME_TO_EXCLUDE}`,
                )
            })
        })

        it('all queries should have the same dimensions', () => {
            const handover = handoverInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const snoozed = snoozedInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const total = totalInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            const expectedDimensions = [
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
            ]

            expect(handover.dimensions).toEqual(expectedDimensions)
            expect(snoozed.dimensions).toEqual(expectedDimensions)
            expect(total.dimensions).toEqual(expectedDimensions)
        })

        it('all queries should have the same measures', () => {
            const handover = handoverInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const snoozed = snoozedInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )
            const total = totalInteractionsPerIntentQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
                intentCustomFieldId,
            )

            const expectedMeasures = [
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ]

            expect(handover.measures).toEqual(expectedMeasures)
            expect(snoozed.measures).toEqual(expectedMeasures)
            expect(total.measures).toEqual(expectedMeasures)
        })
    })
})
