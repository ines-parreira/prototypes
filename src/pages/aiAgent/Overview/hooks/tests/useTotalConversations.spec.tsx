import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks/dom'

import React from 'react'

import {StatType} from 'models/stat/types'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {useTotalConversations} from '../useTotalConversations'

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useTotalConversations', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())

        const {result} = renderHook(() => useTotalConversations(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                title: 'Total Conversations',
                hint: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
                metricType: StatType.Number,
                value: 843,
                prevValue: 754,
                isLoading: false,
            })
        })
    })
})
