import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import moment from 'moment'

import { StatsFilters } from 'models/stat/types'
import {
    fetchDiscountCodesAppliedTrend,
    useDiscountCodesAppliedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend'
import {
    fetchDiscountCodesOfferedTrend,
    useDiscountCodesOfferedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesOfferedTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    fetchDiscountCodesRateAppliedTrend,
    useDiscountCodesRateAppliedTrend,
} from '../useDiscountCodesRateAppliedTrend'

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

jest.mock(
    'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesOfferedTrend',
)
const useDiscountCodesOfferedMock = assumeMock(useDiscountCodesOfferedTrend)
const fetchDiscountCodesOfferedMock = assumeMock(fetchDiscountCodesOfferedTrend)

jest.mock(
    'pages/stats/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend',
)
const useDiscountCodesAppliedMock = assumeMock(useDiscountCodesAppliedTrend)
const fetchDiscountCodesAppliedMock = assumeMock(fetchDiscountCodesAppliedTrend)

describe('DiscountCodesRateApplied', () => {
    describe('useDiscountCodesRateApplied', () => {
        it('should return correct metric data when the query resolves', async () => {
            useDiscountCodesOfferedMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 20,
                },
            })
            useDiscountCodesAppliedMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 2,
                },
            })

            const { result } = renderHook(
                () => useDiscountCodesRateAppliedTrend(statsFilters, timezone),
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
                        prevValue: 0.1,
                        value: 0.2,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchDiscountCodesRateApplied', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchDiscountCodesOfferedMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 20,
                },
            } as unknown as ReturnType<typeof fetchDiscountCodesOfferedTrend>)
            fetchDiscountCodesAppliedMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 2,
                },
            } as unknown as ReturnType<typeof fetchDiscountCodesAppliedTrend>)

            const result = await fetchDiscountCodesRateAppliedTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    prevValue: 0.1,
                    value: 0.2,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
