import {renderHook} from '@testing-library/react-hooks'

import {aiManagedTicketInputFieldDefinition} from 'fixtures/customField'
import {CUSTOM_FIELD_AI_AGENT_HANDOVER} from 'hooks/reporting/automate/types'
import {useMetric} from 'hooks/reporting/useMetric'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'

import {
    AutomatedDatesetEventTypes,
    AutomationDatasetDimension,
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMember} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {customerSatisfactionPerCustomFieldQueryFactory} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import {
    automationDatasetAdditionalFilters,
    automationDatasetDefaultFilters,
} from 'models/reporting/queryFactories/automate_v2/filters'
import {
    customFieldsTicketCountQueryFactory,
    customFieldsTicketFactory,
    customFieldsTicketTotalCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingFilterOperator} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'

import {
    useAIAgentResourcePerTicket,
    useAiAgenTickets,
    useAiAgentTicketCountPerIntent,
    useCustomerSatisfactionMetricPerIntent,
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
    const customField = aiManagedTicketInputFieldDefinition

    describe('useTotalAiAgentTicketsByCustomField', () => {
        it('should pass the query to useMetric hook', () => {
            renderHook(
                () =>
                    useTotalAiAgentTicketsByCustomField(
                        filters,
                        timezone,
                        customField,
                        sorting
                    ),
                {}
            )

            expect(useMetricMock).toHaveBeenCalledWith(
                customFieldsTicketTotalCountQueryFactory(
                    filters,
                    timezone,
                    String(customField.id),
                    sorting
                )
            )
        })
    })

    describe('useAiAgenTickets', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () => useAiAgenTickets(filters, timezone, customField),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketFactory(
                    filters,
                    timezone,
                    String(customField.id)
                )
            )
        })

        it('should pass additional filters to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgenTickets(
                        filters,
                        timezone,
                        customField,
                        CUSTOM_FIELD_AI_AGENT_HANDOVER,
                        sorting
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketFactory(
                    filters,
                    timezone,
                    String(customField.id),
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                        operator: ReportingFilterOperator.Contains,
                        values: [CUSTOM_FIELD_AI_AGENT_HANDOVER],
                    },
                    sorting
                )
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
                        customField
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    filters,
                    timezone,
                    String(customField.id)
                )
            )
        })

        it('should pass additional filters to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useAiAgentTicketCountPerIntent(
                        filters,
                        timezone,
                        customField,
                        ['1', '2'],
                        sorting
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    filters,
                    timezone,
                    String(customField.id),
                    sorting,
                    {
                        member: TicketDimension.TicketId,
                        operator: ReportingFilterOperator.In,
                        values: ['1', '2'],
                    }
                )
            )
        })
    })

    describe('useCustomerSatisfactionMetricPerIntent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomerSatisfactionMetricPerIntent(
                        filters,
                        timezone,
                        customField,
                        sorting
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customerSatisfactionPerCustomFieldQueryFactory(
                    filters,
                    timezone,
                    sorting,
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(customField.id)],
                    }
                )
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
                        sorting
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith({
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                dimensions: [AutomationDatasetDimension.TicketId],
                timezone,
                filters: [
                    ...automationDatasetDefaultFilters(filters),
                    ...automationDatasetAdditionalFilters(filters),
                    {
                        member: AutomationDatasetFilterMember.TicketId,
                        operator: ReportingFilterOperator.In,
                        values: ticketIds,
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            AutomatedDatesetEventTypes.AiAgentRecommendedResource,
                        ],
                    },
                ],
                order: [[AutomationDatasetDimension.TicketId, sorting]],
            })
        })

        it('should handle empty ticketIds array', () => {
            renderHook(
                () =>
                    useAIAgentResourcePerTicket(filters, timezone, [], sorting),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith({
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                dimensions: [AutomationDatasetDimension.TicketId],
                timezone,
                filters: [
                    ...automationDatasetDefaultFilters(filters),
                    ...automationDatasetAdditionalFilters(filters),
                    {
                        member: AutomationDatasetFilterMember.TicketId,
                        operator: ReportingFilterOperator.In,
                        values: [],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            AutomatedDatesetEventTypes.AiAgentRecommendedResource,
                        ],
                    },
                ],
                order: [[AutomationDatasetDimension.TicketId, sorting]],
            })
        })

        it('should handle undefined sorting', () => {
            renderHook(
                () => useAIAgentResourcePerTicket(filters, timezone, ticketIds),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith({
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                dimensions: [AutomationDatasetDimension.TicketId],
                timezone,
                filters: [
                    ...automationDatasetDefaultFilters(filters),
                    ...automationDatasetAdditionalFilters(filters),
                    {
                        member: AutomationDatasetFilterMember.TicketId,
                        operator: ReportingFilterOperator.In,
                        values: ticketIds,
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            AutomatedDatesetEventTypes.AiAgentRecommendedResource,
                        ],
                    },
                ],
            })
        })
    })
})
