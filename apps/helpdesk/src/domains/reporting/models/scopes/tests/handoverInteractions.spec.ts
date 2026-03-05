import {
    aiAgentHandoverInteractions,
    aiAgentHandoverInteractionsV2QueryFactory,
    aiSalesAgentHandoverInteractions,
    aiSalesAgentHandoverInteractionsV2QueryFactory,
    aiSupportHandoverInteractions,
    aiSupportHandoverInteractionsV2QueryFactory,
    handoverInteractions,
    handoverInteractionsV2QueryFactory,
} from 'domains/reporting/models/scopes/handoverInteractions'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('handoverInteractionsScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const timezone = 'utc'
    const granularity = 'day' as AggregationWindow

    const context = {
        filters,
        timezone,
        granularity,
    }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    const timeDimensions = [
        {
            dimension: 'eventDatetime',
            granularity: 'day',
        },
    ]

    describe('handoverInteractions', () => {
        it('creates query', () => {
            const actual = handoverInteractions.build(context)

            expect(actual).toEqual({
                metricName: 'handover-interactions',
                scope: 'handover-interactions',
                measures: ['handoverInteractionsCount'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('aiAgentHandoverInteractions', () => {
        it('creates query with automationFeatureType filter for ai-agent', () => {
            const actual = aiAgentHandoverInteractions.build(context)

            expect(actual).toEqual({
                metricName: 'ai-agent-handover-interactions',
                scope: 'handover-interactions',
                measures: ['handoverInteractionsCount'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['ai-agent'],
                    },
                ],
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('aiSalesAgentHandoverInteractions', () => {
        it('creates query with aiAgentSkill filter for ai-agent-sales', () => {
            const actual = aiSalesAgentHandoverInteractions.build(context)

            expect(actual).toEqual({
                metricName: 'ai-sales-agent-handover-interactions',
                scope: 'handover-interactions',
                measures: ['handoverInteractionsCount'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'aiAgentSkill',
                        operator: 'one-of',
                        values: ['ai-agent-sales'],
                    },
                ],
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('aiSupportHandoverInteractions', () => {
        it('creates query with aiAgentSkill filter for ai-agent-support', () => {
            const actual = aiSupportHandoverInteractions.build(context)

            expect(actual).toEqual({
                metricName: 'ai-agent-support-handover-interactions',
                scope: 'handover-interactions',
                measures: ['handoverInteractionsCount'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'aiAgentSkill',
                        operator: 'one-of',
                        values: ['ai-agent-support'],
                    },
                ],
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('handoverInteractionsV2QueryFactory', () => {
            it('returns the same result as calling build directly', () => {
                expect(handoverInteractionsV2QueryFactory(context)).toEqual(
                    handoverInteractions.build(context),
                )
            })
        })

        describe('aiAgentHandoverInteractionsV2QueryFactory', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    aiAgentHandoverInteractionsV2QueryFactory(context),
                ).toEqual(aiAgentHandoverInteractions.build(context))
            })
        })

        describe('aiSalesAgentHandoverInteractionsV2QueryFactory', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    aiSalesAgentHandoverInteractionsV2QueryFactory(context),
                ).toEqual(aiSalesAgentHandoverInteractions.build(context))
            })
        })

        describe('aiSupportHandoverInteractionsV2QueryFactory', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    aiSupportHandoverInteractionsV2QueryFactory(context),
                ).toEqual(aiSupportHandoverInteractions.build(context))
            })
        })
    })
})
