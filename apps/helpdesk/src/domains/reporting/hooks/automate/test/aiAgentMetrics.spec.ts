import { assumeMock, renderHook } from '@repo/testing'

import {
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
    aiAgentTouchedTicketQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import {
    aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory,
    aiAgentTicketsPerIntentCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
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
