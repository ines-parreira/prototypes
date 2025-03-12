import { renderHook } from '@testing-library/react-hooks'

import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'hooks/reporting/automate/types'
import { useMetric } from 'hooks/reporting/useMetric'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    aiAgentTouchedTicketQueryFactory,
    allTicketsForAiAgentTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import { customFieldsTicketCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { ReportingFilterOperator } from 'models/reporting/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import {
    useAIAgentResourcePerTicket,
    useAiAgentTicketCountPerIntent,
    useAiAgentTickets,
    useCustomerSatisfactionMetricPerIntentLevel,
    useTotalAiAgentTicketsByCustomField,
} from '../aiAgentMetrics'

jest.mock('hooks/reporting/useMetric')
jest.mock('hooks/reporting/useMetricPerDimension')

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

    describe('useTotalAiAgentTicketsByCustomField', () => {
        it('should pass the query to useMetric hook', () => {
            renderHook(
                () =>
                    useTotalAiAgentTicketsByCustomField(
                        filters,
                        timezone,
                        intentFieldId,
                        sorting,
                    ),
                {},
            )

            expect(useMetricMock).toHaveBeenCalledWith(
                allTicketsForAiAgentTotalCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                    sorting,
                }),
            )
        })
    })

    describe('useAiAgenTickets', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTickets(
                        filters,
                        timezone,
                        outcomeFieldId,
                        intentFieldId,
                    ),
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
                    useAiAgentTickets(
                        filters,
                        timezone,
                        outcomeFieldId,
                        intentFieldId,
                        ReportingFilterOperator.Contains,
                        CUSTOM_FIELD_AI_AGENT_HANDOVER,
                        sorting,
                    ),
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
                    useAiAgentTicketCountPerIntent(
                        filters,
                        timezone,
                        intentFieldId,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    filters,
                    timezone,
                    String(intentFieldId),
                ),
            )
        })

        it('should pass additional filters to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTicketCountPerIntent(
                        filters,
                        timezone,
                        intentFieldId,
                        ['1', '2'],
                        sorting,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    filters,
                    timezone,
                    String(intentFieldId),
                    sorting,
                    [
                        {
                            member: TicketDimension.TicketId,
                            operator: ReportingFilterOperator.In,
                            values: ['1', '2'],
                        },
                    ],
                ),
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
                customerSatisfactionPerIntentLevelQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            )
        })
    })
})
