import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks/dom'

import React from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatsFilters, StatType} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {useCoverageRate} from '../useCoverageRate'

const queryClient = mockQueryClient()

jest.useFakeTimers()
jest.mock('hooks/reporting/useMultipleMetricsTrend')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

const timezone = 'UTC'

const filters: StatsFilters = {
    period: {
        start_datetime: '',
        end_datetime: '',
    },
}

describe('useCoverageRate', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
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

        const {result} = renderHook(() => useCoverageRate(filters, timezone), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual({
            title: 'Coverage Rate',
            hint: 'Percentage of tickets that AI Agent attempted to respond to.',
            metricType: StatType.Percent,
            value: 1.55,
            prevValue: 3.5,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const {result} = renderHook(() => useCoverageRate(filters, timezone), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual({
            title: 'Coverage Rate',
            hint: 'Percentage of tickets that AI Agent attempted to respond to.',
            metricType: StatType.Percent,
            value: 0,
            prevValue: 0,
            isLoading: true,
        })
    })
})
