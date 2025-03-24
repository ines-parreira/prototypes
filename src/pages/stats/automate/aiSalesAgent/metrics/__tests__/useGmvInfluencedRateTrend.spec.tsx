import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    fetchGmvInfluencedRateTrend,
    useGmvInfluencedRateTrend,
} from '../useGmvInfluencedRateTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from '../useGmvInfluencedTrend'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
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

jest.mock('pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedTrend')
const useGmvTrendMock = assumeMock(useGmvInfluencedTrend)
const fetchGmvTrendMock = assumeMock(fetchGmvInfluencedTrend)

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

jest.useFakeTimers()

describe('gmvInfluencedRateTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useGmvInfluecedTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            useGmvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 32,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 24,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useGmvInfluencedRateTrend(statsFilters, timezone),
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
                        prevValue: 0.08333333333333333,
                        value: 0.3125,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchGmvInfluncedTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchGmvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<typeof fetchGmvInfluencedTrend>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.GmvUsd]: 32 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.GmvUsd]: 24 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchGmvInfluencedRateTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    prevValue: 0.08333333333333333,
                    value: 0.3125,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
