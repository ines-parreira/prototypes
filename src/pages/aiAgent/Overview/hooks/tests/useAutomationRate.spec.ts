import { renderHook } from '@testing-library/react-hooks/dom'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { StatsFilters, StatType } from 'models/stat/types'
import { useAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAutomationRate'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
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
                'AutomationDataset.automatedInteractions': {
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
            useAutomationRate(filters, timezone),
        )

        expect(result.current).toEqual({
            title: 'Automation Rate',
            hint: 'Automated interactions as a percent of all customer interactions.',
            metricType: StatType.Number,
            metricFormat: 'decimal-to-percent',
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
            useAutomationRate(filters, timezone),
        )

        expect(result.current).toEqual({
            title: 'Automation Rate',
            hint: 'Automated interactions as a percent of all customer interactions.',
            metricType: StatType.Number,
            metricFormat: 'decimal-to-percent',
            isLoading: true,
            value: 0,
            prevValue: 0,
        })
    })
})
