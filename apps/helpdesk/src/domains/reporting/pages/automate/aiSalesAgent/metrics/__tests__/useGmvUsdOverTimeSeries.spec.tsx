import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useGmvUsdOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

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

jest.mock('domains/reporting/hooks/useTimeSeries')
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
