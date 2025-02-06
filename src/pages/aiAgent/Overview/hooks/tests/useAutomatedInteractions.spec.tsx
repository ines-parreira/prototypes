import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks/dom'

import React from 'react'

import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatType} from 'models/stat/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {assumeMock} from 'utils/testing'

import {useAutomatedInteractions} from '../useAutomatedInteractions'

const queryClient = mockQueryClient()

jest.mock('hooks/reporting/useMultipleMetricsTrend')

const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)
const timezone = 'UTC'

const filters = {
    period: {
        start_datetime: '',
        end_datetime: '',
    },
}

describe('useAutomatedInteractions', () => {
    it('should return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            data: {
                'AutomationDataset.automatedInteractions': {
                    value: 450,
                    prevValue: 300,
                },
            },
            isFetching: false,
        } as any)

        const {result} = renderHook(
            () => useAutomatedInteractions(filters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            value: 450,
            prevValue: 300,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            isFetching: true,
        } as any)

        const {result} = renderHook(
            () => useAutomatedInteractions(filters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            isLoading: true,
        })
    })
})
