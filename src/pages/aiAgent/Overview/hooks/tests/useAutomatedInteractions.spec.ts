import {renderHook} from '@testing-library/react-hooks/dom'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatsFilters, StatType} from 'models/stat/types'

import {useAutomatedInteractions} from 'pages/aiAgent/Overview/hooks/kpis/useAutomatedInteractions'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useAutomatedInteractions', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as any)
    })

    it('should return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            data: {
                'TicketCustomFieldsEnriched.ticketCount': {
                    value: 450,
                    prevValue: 300,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(() =>
            useAutomatedInteractions(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            value: 450,
            prevValue: 300,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            isFetching: true,
        } as any)

        const {result} = renderHook(() =>
            useAutomatedInteractions(filters, timezone)
        )

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            isLoading: true,
        })
    })
})
