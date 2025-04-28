import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { AiSalesAgentConversationsMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    fetchDiscountCodesOfferedTrend,
    useDiscountCodesOfferedTrend,
} from '../useDiscountCodesOfferedTrend'

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

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

jest.useFakeTimers()

describe('DiscountCodesOfferedTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useDiscountCodesOfferedTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
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
                () => useDiscountCodesOfferedTrend(statsFilters, timezone),
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
                        value: 32,
                        prevValue: 24,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })
    describe('fetchDiscountCodesOfferedTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentConversationsMeasure.Count]: 32 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentConversationsMeasure.Count]: 24 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchDiscountCodesOfferedTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 32,
                    prevValue: 24,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
