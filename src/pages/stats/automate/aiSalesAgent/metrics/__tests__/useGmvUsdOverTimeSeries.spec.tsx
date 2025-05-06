import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useGmvUsdOverTimeSeries } from '../useGmvUsdOverTimeSeries'

const timezone = 'UTC'

const filters: StatsFilters = {
    period: {
        start_datetime: moment()
            .add(1 * 7, 'day')
            .format('YYYY-MM-DDT00:00:00.000'),
        end_datetime: moment()
            .add(3 * 7, 'day')
            .format('YYYY-MM-DDT23:50:59.999'),
    },
}

const queryClient = mockQueryClient()

jest.useFakeTimers()

jest.mock('hooks/reporting/useTimeSeries')
const useTimeSeriesMock = assumeMock(useTimeSeries)

describe('gmvInfluenceOverTimeSeries', () => {
    const defaultData = {
        isLoading: false,
        isError: false,
        data: [
            [
                {
                    dateTime: '2025-02-26T00:00:00.000',
                    value: 269.87,
                    label: AiSalesAgentOrdersMeasure.GmvUsd,
                },

                {
                    dateTime: '2025-09-28T00:00:00.000',
                    value: 145.67,
                    label: AiSalesAgentOrdersMeasure.GmvUsd,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    describe('useGmvInfluenceOverTimeSeries', () => {
        it('should return correct metric data when the query resolves', async () => {
            useTimeSeriesMock.mockReturnValueOnce(defaultData)

            act(() => jest.runAllTimers())
            const { result } = renderHook(
                () =>
                    useGmvUsdOverTimeSeries(
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
                                dateTime: '2025-02-26T00:00:00.000',
                                label: 'AiSalesAgentOrders.gmvUsd',
                                value: 269.87,
                            },
                            {
                                dateTime: '2025-09-28T00:00:00.000',
                                label: 'AiSalesAgentOrders.gmvUsd',
                                value: 145.67,
                            },
                        ],
                    ],
                    isError: false,
                    isLoading: false,
                })
            })
        })
    })
})
