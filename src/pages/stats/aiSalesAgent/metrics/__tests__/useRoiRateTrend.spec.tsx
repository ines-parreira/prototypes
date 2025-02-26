import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'

import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useRoiRateTrend } from '../useRoiRateTrend'

const timezone = 'UTC'

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-02-09T16:56:07.727Z',
    },
}

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useRoiRateTrend', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())
        const { result } = renderHook(
            () => useRoiRateTrend(filters, timezone),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                data: {
                    value: 32.41,
                    prevValue: 24.56,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
