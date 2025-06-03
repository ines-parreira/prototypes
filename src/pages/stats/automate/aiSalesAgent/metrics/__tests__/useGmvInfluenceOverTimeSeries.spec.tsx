import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { fetchTimeSeries, useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    fetchGmvInflueceOverTimeSeries,
    useGmvInfluenceOverTimeSeries,
} from '../useGmvInfluenceOverTimeSeries'

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
const fetchTimeSeriesMock = assumeMock(fetchTimeSeries)

describe('gmvInfluenceOverTimeSeries', () => {
    const defaultData = {
        isFetching: false,
        isFetched: true,
        isError: false,
        data: [
            [
                {
                    dateTime: '2025-02-26T00:00:00.000',
                    value: 10,
                    label: AiSalesAgentOrdersMeasure.Gmv,
                },
                {
                    dateTime: '2025-09-28T00:00:00.000',
                    value: 5,
                    label: AiSalesAgentOrdersMeasure.Gmv,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    describe('useGmvInfluenceOverTimeSeries', () => {
        it('should return correct metric data when the query resolves', async () => {
            // influenced GMV
            useTimeSeriesMock.mockReturnValueOnce(defaultData)

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
                                dateTime: '2025-02-26T00:00:00.000',
                                label: AiSalesAgentOrdersMeasure.Gmv,
                                value: 10,
                            },
                            {
                                dateTime: '2025-09-28T00:00:00.000',
                                label: AiSalesAgentOrdersMeasure.Gmv,
                                value: 5,
                            },
                        ],
                    ],
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchGmvInfluenceOverTimeSeries', () => {
        it('should return correct metric data when the query resolves', async () => {
            // influenced GMV
            fetchTimeSeriesMock.mockReturnValueOnce(
                defaultData.data as unknown as ReturnType<
                    typeof fetchTimeSeries
                >,
            )

            const result = await fetchGmvInflueceOverTimeSeries(
                filters,
                timezone,
                ReportingGranularity.Day,
            )

            expect(result).toEqual([
                [
                    {
                        dateTime: '2025-02-26T00:00:00.000',
                        label: AiSalesAgentOrdersMeasure.Gmv,
                        value: 10,
                    },
                    {
                        dateTime: '2025-09-28T00:00:00.000',
                        label: AiSalesAgentOrdersMeasure.Gmv,
                        value: 5,
                    },
                ],
            ])
        })
    })
})
