import {
    aiAgentDynamicOutcomeBreakdown,
    dynamicAiAgentOutcomeBreakdownQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentTicketFields'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentTicketFieldsScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = {
        filters,
        timezone: 'utc',
        dimensions: ['aiOutcomeCustomField', 'aiAgentRole'] as const,
    }

    describe('aiAgentDynamicOutcomeBreakdown', () => {
        it('builds a single query broken down by outcome and agent role', () => {
            const actual = aiAgentDynamicOutcomeBreakdown.build(context)

            expect(actual).toEqual({
                measures: ['ticketCount'],
                dimensions: ['aiOutcomeCustomField', 'aiAgentRole'],
                limit: 10_000,
                filters: [
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
                ],
                timezone: 'utc',
                metricName:
                    'ai-agent-dynamic-all-agents-intent-breakdown-per-role-and-outcome',
                scope: 'ai-agent-ticket-fields',
            })
        })

        it('applies channel and store filters from context', () => {
            const actual = aiAgentDynamicOutcomeBreakdown.build({
                ...context,
                filters: {
                    ...filters,
                    [FilterKey.Channels]: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['email', 'chat'],
                    },
                    [FilterKey.Stores]: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [123],
                    },
                },
            })

            expect(actual.filters).toContainEqual({
                member: 'channel',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email', 'chat'],
            })
            expect(actual.filters).toContainEqual({
                member: 'storeIntegrationId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            })
        })

        it('exposes a factory that mirrors build with the given metric name', () => {
            const metricName =
                'ai-agent-dynamic-all-agents-intent-breakdown-per-role-and-outcome' as const
            expect(
                dynamicAiAgentOutcomeBreakdownQueryFactoryV2(
                    context,
                    metricName,
                ),
            ).toEqual({
                ...aiAgentDynamicOutcomeBreakdown.build(context),
                metricName,
            })
        })
    })
})
