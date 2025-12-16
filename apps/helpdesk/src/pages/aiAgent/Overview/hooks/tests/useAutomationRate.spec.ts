import { assumeMock, renderHook } from '@repo/testing'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useAiAgentTicketNoHandover } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover'
import { useAllTickets } from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('pages/aiAgent/Overview/hooks/kpis/useAllTickets')
const useAllTicketsMock = assumeMock(useAllTickets)

jest.mock('pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover')
const useAiAgentTicketNoHandoverMock = assumeMock(useAiAgentTicketNoHandover)

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
        useAllTicketsMock.mockReturnValue({
            data: { value: 2, prevValue: 1 },
            isFetching: false,
            isError: false,
        } as any)

        useAiAgentTicketNoHandoverMock.mockReturnValue({
            data: {
                'TicketCustomFieldsEnriched.ticketCount': {
                    value: 3.1,
                    prevValue: 3.5,
                },
            },
            isFetching: false,
            isError: false,
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
        useAllTicketsMock.mockReturnValue({
            isFetching: true,
            isError: false,
        } as any)

        useAiAgentTicketNoHandoverMock.mockReturnValue({
            isFetching: false,
            isError: false,
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
