import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks/dom'

import React from 'react'

import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatsFilters, StatType} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {useCsat} from '../useCsat'

const queryClient = mockQueryClient()

jest.mock('hooks/reporting/useMultipleMetricsTrend')

const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

const timezone = 'UTC'

const filters: StatsFilters = {
    period: {
        start_datetime: '',
        end_datetime: '',
    },
}

describe('useCsat', () => {
    it('useCsat return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 3.1,
                    prevValue: 3.5,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(() => useCsat(filters, timezone), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual({
            title: 'CSAT (Customer Satisfaction Score)',
            hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            metricType: StatType.Number,
            value: 3.1,
            prevValue: 3.5,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const {result} = renderHook(() => useCsat(filters, timezone), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual({
            title: 'CSAT (Customer Satisfaction Score)',
            hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            metricType: StatType.Number,
            isLoading: true,
        })
    })
})
