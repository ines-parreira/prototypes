import { assumeMock, renderHook } from '@repo/testing'

import {
    useAIAgentResourcePerTicket,
    useAiAgentTicketCountFromTicketCustomFieldsPerIntent,
    useAiAgentTicketCountPerIntent,
    useAiAgentTickets,
    useCustomerSatisfactionMetricPerIntentLevel,
    useTotalAiAgentTicketsByCustomField,
} from 'domains/reporting/hooks/automate/aiAgentMetrics'
import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'domains/reporting/hooks/automate/types'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'domains/reporting/models/cubes/automate_v2/RecommendedResourcesCube'
import {
    aiAgentTouchedTicketQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import {
    aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory,
    aiAgentTicketsPerIntentCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')

const useMetricMock = assumeMock(useMetric)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('aiAgentMetrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const sorting = OrderDirection.Asc
    const intentFieldId = 1
    const outcomeFieldId = 2
    const intentId = 'Order'

    describe('useTotalAiAgentTicketsByCustomField', () => {
        it('should pass the query to useMetric hook', () => {
            renderHook(
                () =>
                    useTotalAiAgentTicketsByCustomField(
                        filters,
                        timezone,
                        intentFieldId,
                        outcomeFieldId,
                        sorting,
                    ),
                {},
            )

            expect(useMetricMock).toHaveBeenCalledWith(
                aiAgentTouchedTicketTotalCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                    outcomeFieldId,
                    sorting,
                }),
            )
        })
    })

    describe('useAiAgenTickets', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTickets({
                        filters,
                        timezone,
                        outcomeFieldId,
                        intentFieldId,
                    }),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                aiAgentTouchedTicketQueryFactory({
                    filters,
                    timezone,
                    outcomeFieldId,
                    intentFieldId,
                }),
            )
        })

        it('should pass additional filters to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTickets({
                        filters,
                        timezone,
                        outcomeFieldId,
                        intentFieldId,
                        operator: ReportingFilterOperator.Contains,
                        customFieldFilter: CUSTOM_FIELD_AI_AGENT_HANDOVER,
                        sorting,
                    }),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                aiAgentTouchedTicketQueryFactory({
                    filters,
                    timezone,
                    outcomeFieldId,
                    intentFieldId,
                    operator: ReportingFilterOperator.Contains,
                    customFieldFilter: CUSTOM_FIELD_AI_AGENT_HANDOVER,
                    sorting,
                }),
            )
        })
    })

    describe('useAiAgentTicketCountPerIntent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTicketCountPerIntent({
                        filters,
                        timezone,
                        intentFieldId,
                    }),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                aiAgentTicketsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                }),
            )
        })

        it('should pass additional filters with ticket ids to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTicketCountPerIntent({
                        filters,
                        timezone,
                        intentFieldId,
                        ticketIds: ['1', '2'],
                        sorting,
                    }),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                aiAgentTicketsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId: intentFieldId,
                    ticketIds: ['1', '2'],
                    sorting,
                }),
            )
        })

        it('should pass additional filters with ticket ids and intentId to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTicketCountPerIntent({
                        filters,
                        timezone,
                        intentFieldId,
                        ticketIds: ['1', '2'],
                        intentId: intentId,
                        sorting,
                    }),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                aiAgentTicketsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId: intentFieldId,
                    ticketIds: ['1', '2'],
                    intentId: intentId,
                    sorting,
                }),
            )
        })
    })

    describe('useAIAgentResourcePerTicket', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
        }
        const timezone = 'UTC'
        const ticketIds = ['489105395', '489104880']
        const sorting = OrderDirection.Asc

        it('should pass the correct query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAIAgentResourcePerTicket(
                        filters,
                        timezone,
                        ticketIds,
                        sorting,
                        false,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                {
                    measures: [
                        RecommendedResourcesMeasure.NumRecommendedResources,
                    ],
                    dimensions: [
                        RecommendedResourcesDimension.TicketId,
                        RecommendedResourcesDimension.RecommendedResourceId,
                    ],
                    timezone,
                    filters: [
                        {
                            member: RecommendedResourcesFilterMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [
                                formatReportingQueryDate(
                                    filters.period.start_datetime,
                                ),
                            ],
                        },
                        {
                            member: RecommendedResourcesFilterMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [
                                formatReportingQueryDate(
                                    filters.period.end_datetime,
                                ),
                            ],
                        },
                        {
                            member: RecommendedResourcesFilterMember.TicketId,
                            operator: ReportingFilterOperator.In,
                            values: ticketIds,
                        },
                    ],
                    order: [
                        [RecommendedResourcesFilterMember.TicketId, sorting],
                    ],
                },
                undefined,
                false,
            )
        })

        it('should handle empty ticketIds array', () => {
            renderHook(
                () =>
                    useAIAgentResourcePerTicket(
                        filters,
                        timezone,
                        [],
                        sorting,
                        true,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                {
                    measures: [
                        RecommendedResourcesMeasure.NumRecommendedResources,
                    ],
                    dimensions: [
                        RecommendedResourcesDimension.TicketId,
                        RecommendedResourcesDimension.RecommendedResourceId,
                    ],
                    timezone,
                    filters: [
                        {
                            member: RecommendedResourcesFilterMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [
                                formatReportingQueryDate(
                                    filters.period.start_datetime,
                                ),
                            ],
                        },
                        {
                            member: RecommendedResourcesFilterMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [
                                formatReportingQueryDate(
                                    filters.period.end_datetime,
                                ),
                            ],
                        },
                        {
                            member: RecommendedResourcesFilterMember.TicketId,
                            operator: ReportingFilterOperator.In,
                            values: [],
                        },
                    ],
                    order: [
                        [RecommendedResourcesFilterMember.TicketId, sorting],
                    ],
                },
                undefined,
                true,
            )
        })

        it('should handle undefined sorting', () => {
            renderHook(
                () => useAIAgentResourcePerTicket(filters, timezone, ticketIds),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                {
                    measures: [
                        RecommendedResourcesMeasure.NumRecommendedResources,
                    ],
                    dimensions: [
                        RecommendedResourcesDimension.TicketId,
                        RecommendedResourcesDimension.RecommendedResourceId,
                    ],
                    timezone,
                    filters: [
                        {
                            member: RecommendedResourcesFilterMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [
                                formatReportingQueryDate(
                                    filters.period.start_datetime,
                                ),
                            ],
                        },
                        {
                            member: RecommendedResourcesFilterMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [
                                formatReportingQueryDate(
                                    filters.period.end_datetime,
                                ),
                            ],
                        },
                        {
                            member: RecommendedResourcesFilterMember.TicketId,
                            operator: ReportingFilterOperator.In,
                            values: ticketIds,
                        },
                    ],
                },
                undefined,
                undefined,
            )
        })
    })

    describe('useCustomerSatisfactionMetricPerIntentLevel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomerSatisfactionMetricPerIntentLevel(
                        filters,
                        timezone,
                        sorting,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customerSatisfactionPerIntentLevelQueryFactory({
                    filters,
                    timezone,
                    sorting,
                }),
            )
        })
    })

    describe('useAiAgentTicketCountFromTicketCustomFieldsPerIntent', () => {
        it('should pass the correct query to useMetricPerDimension hook', () => {
            const filters = {
                period: {
                    start_datetime: '2021-01-01T00:00:00Z',
                    end_datetime: '2021-01-02T00:00:00Z',
                },
            }
            const timezone = 'UTC'
            const intentFieldId = 123
            const outcomeFieldId = 456
            const integrationIds = ['integration1', 'integration2']
            const sorting = OrderDirection.Asc
            const intentId = 'intent123'
            const outcomeValuesToExclude = ['value1', 'value2']
            const outcomeValueToInclude = 'value3'

            renderHook(() =>
                useAiAgentTicketCountFromTicketCustomFieldsPerIntent({
                    filters,
                    timezone,
                    intentFieldId,
                    outcomeFieldId,
                    integrationIds,
                    sorting,
                    intentId,
                    outcomeValuesToExclude,
                    outcomeValueToInclude,
                }),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                    outcomeFieldId,
                    integrationIds,
                    sorting,
                    intentId,
                    outcomeValuesToExclude,
                    outcomeValueToInclude,
                }),
            )
        })
    })
})
