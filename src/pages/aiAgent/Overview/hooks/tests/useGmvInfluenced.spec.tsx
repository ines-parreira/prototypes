import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'

import { StatType } from 'models/stat/types'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useGmvInfluenced', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())

        const { result } = renderHook(() => useGmvInfluenced(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                title: 'GMV Influenced',
                hint: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
                metricType: StatType.Currency,
                value: 12000,
                prevValue: 10000,
                isLoading: false,
                currency: 'USD',
            })
        })
    })
})
