import { renderHook } from '@testing-library/react-hooks/dom'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { StatsFilters, StatType } from 'models/stat/types'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import { assumeMock } from 'utils/testing'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useCoverageRate', () => {
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

        const { result } = renderHook(() => useCoverageRate(filters, timezone))

        expect(result.current).toEqual({
            'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
            title: 'Coverage Rate',
            hint: 'Percentage of tickets that AI Agent attempted to respond to.',
            metricType: StatType.Number,
            metricFormat: 'decimal-to-percent',
            value: 1.55,
            prevValue: 3.5,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderHook(() => useCoverageRate(filters, timezone))

        expect(result.current).toEqual({
            title: 'Coverage Rate',
            'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
            hint: 'Percentage of tickets that AI Agent attempted to respond to.',
            metricType: StatType.Number,
            metricFormat: 'decimal-to-percent',
            value: 0,
            prevValue: 0,
            isLoading: true,
        })
    })
})
