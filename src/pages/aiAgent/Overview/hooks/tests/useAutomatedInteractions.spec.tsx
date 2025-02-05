import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks/dom'

import React from 'react'

import {StatType} from 'models/stat/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {useAutomatedInteractions} from '../useAutomatedInteractions'

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useAutomatedInteractions', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())

        const {result} = renderHook(() => useAutomatedInteractions(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                title: 'Automated Interactions',
                hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
                metricType: StatType.Number,
                value: 450,
                prevValue: 300,
                isLoading: false,
            })
        })
    })
})
