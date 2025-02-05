import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks/dom'

import React from 'react'

import {StatType} from 'models/stat/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {useCoverageRate} from '../useCoverageRate'

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useCoverageRate', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())

        const {result} = renderHook(() => useCoverageRate(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                title: 'Coverage Rate',
                hint: 'Percentage of tickets that AI Agent attempted to respond to.',
                metricType: StatType.Percent,
                value: 30,
                prevValue: 25,
                isLoading: false,
            })
        })
    })
})
