import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'

import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useGmvInfluenceOverTimeSeries from '../useGmvInfluenceOverTimeSeries'

const timezone = 'UTC'

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-02-09T16:56:07.727Z',
    },
}

const queryClient = mockQueryClient()

jest.useFakeTimers()

describe('useGmvInfluenceOverTimeSeries', () => {
    it('should return correct metric data when the query resolves', async () => {
        act(() => jest.runAllTimers())
        const { result } = renderHook(
            () =>
                useGmvInfluenceOverTimeSeries(
                    filters,
                    timezone,
                    ReportingGranularity.Day,
                ),
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
                data: [
                    [
                        {
                            dateTime: '2025-02-13T00:00:00.000',
                            value: 0.9,
                            label: 'AiSalesAgent.GmvInfluencedOverTime',
                        },
                        {
                            dateTime: '2025-02-14T00:00:00.000',
                            value: 0.9,
                            label: 'AiSalesAgent.GmvInfluencedOverTime',
                        },
                        {
                            dateTime: '2025-02-15T00:00:00.000',
                            value: 0.04,
                            label: 'AiSalesAgent.GmvInfluencedOverTime',
                        },
                        {
                            dateTime: '2025-02-17T00:00:00.000',
                            value: 0.4,
                            label: 'AiSalesAgent.GmvInfluencedOverTime',
                        },
                        {
                            dateTime: '2025-02-18T00:00:00.000',
                            value: 0.06,
                            label: 'AiSalesAgent.GmvInfluencedOverTime',
                        },
                    ],
                ],
            })
        })
    })
})
