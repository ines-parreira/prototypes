import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks/dom'

import React from 'react'

import {StatType} from 'models/stat/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {useAutomationRate} from '../useAutomationRate'

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useAutomationRate', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())

        const {result} = renderHook(() => useAutomationRate(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                title: 'Automation Rate',
                hint: 'Automated interactions as a percent of all customer interactions.',
                metricType: StatType.Percent,
                isLoading: false,
                value: 32.41,
                prevValue: 24.56,
            })
        })
    })
})
