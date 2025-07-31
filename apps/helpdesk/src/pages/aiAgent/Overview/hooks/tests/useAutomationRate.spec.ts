import { renderHook } from '@repo/testing'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}
const timezone = 'UTC'

describe('useAutomationRate', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as any)
    })

    it('should return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketCustomFieldsEnriched.ticketCount': {
                    value: 3.1,
                    prevValue: 3.5,
                },
                'TicketEnriched.ticketCount': {
                    value: 2,
                    prevValue: 1,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useAiAgentAutomationRate(filters, timezone),
        )

        expect(result.current).toEqual({
            'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
            title: 'AI Agent Automation Rate',
            hint: {
                title: 'Automated interactions from AI Agent as a percent of all customer interactions.',
            },
            metricFormat: 'decimal-to-percent-precision-1',
            isLoading: false,
            prevValue: 3.5,
            value: 1.55,
        })
    })

    it('should return correct metric data when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderHook(() =>
            useAiAgentAutomationRate(filters, timezone),
        )

        expect(result.current).toEqual({
            'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
            title: 'AI Agent Automation Rate',
            hint: {
                title: 'Automated interactions from AI Agent as a percent of all customer interactions.',
            },
            metricFormat: 'decimal-to-percent-precision-1',
            isLoading: true,
            value: 0,
            prevValue: 0,
        })
    })
})
