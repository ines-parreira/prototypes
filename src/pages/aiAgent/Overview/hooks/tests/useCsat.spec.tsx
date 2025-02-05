import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks/dom'

import React from 'react'

import {StatType} from 'models/stat/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {useCsat} from '../useCsat'

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useCsat', () => {
    it('useCsat return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())

        const {result} = renderHook(() => useCsat(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                title: 'CSAT (Customer Satisfaction Score)',
                hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
                metricType: StatType.Number,
                value: 3.1,
                prevValue: 3.5,
                isLoading: false,
            })
        })
    })
})
