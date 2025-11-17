import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { satisfiedOrBreachedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

const mockData = {
    data: {
        value: null,
        decile: null,
        allData: [],
    },
    isFetching: false,
    isError: false,
}

describe('SatisfiedOrBreachedTicketsInPolicyPerStatus', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const timeZone = 'UTC'
    const sorting = OrderDirection.Desc
    const slaStatus = TicketSLAStatus.Breached

    beforeEach(() => {
        useMetricPerDimensionMock.mockReturnValue(mockData)
    })

    describe('useSatisfiedOrBreachedTicketsInPolicyPerStatus', () => {
        it('should call a queryFactory', () => {
            renderHook(() =>
                useSatisfiedOrBreachedTicketsInPolicyPerStatus(
                    filters,
                    timeZone,
                    sorting,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                undefined,
            )
        })

        it('should call a queryFactory with specific SlaStatus', () => {
            renderHook(() =>
                useSatisfiedOrBreachedTicketsInPolicyPerStatus(
                    filters,
                    timeZone,
                    sorting,
                    slaStatus,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                slaStatus,
            )
        })
    })

    describe('useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend', () => {
        it('should call a queryFactory for current and previousPeriod', () => {
            renderHook(() =>
                useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                    filters,
                    timeZone,
                    sorting,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                undefined,
            )
            expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                undefined,
            )
        })

        it('should call a queryFactory with specific SlaStatus', () => {
            renderHook(() =>
                useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                    filters,
                    timeZone,
                    sorting,
                    slaStatus,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                slaStatus,
            )
            expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                slaStatus,
            )
        })

        it('should return loading state', () => {
            const isFetching = true
            useMetricPerDimensionMock.mockReturnValue({
                isFetching,
                isError: false,
                data: null,
            })

            const { result } = renderHook(() =>
                useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                    filters,
                    timeZone,
                    sorting,
                    slaStatus,
                ),
            )

            expect(result.current.isFetching).toEqual(isFetching)
        })

        it('should return error state', () => {
            const isError = true
            useMetricPerDimensionMock.mockReturnValue({
                isFetching: false,
                isError,
                data: null,
            })

            const { result } = renderHook(() =>
                useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                    filters,
                    timeZone,
                    sorting,
                    slaStatus,
                ),
            )

            expect(result.current.isError).toEqual(isError)
        })
    })

    describe('fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend', () => {
        beforeEach(() => {
            fetchMetricPerDimensionMock.mockResolvedValue({
                isFetching: false,
                isError: false,
                data: null,
            })
        })

        it('should call a queryFactory for current and previousPeriod', async () => {
            await fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                undefined,
            )
            expect(fetchMetricPerDimensionMock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                undefined,
            )
        })

        it('should call a queryFactory with specific SlaStatus', async () => {
            await fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
                slaStatus,
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                slaStatus,
            )
            expect(fetchMetricPerDimensionMock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                slaStatus,
            )
        })

        it('should return loading state', async () => {
            const isFetching = true
            fetchMetricPerDimensionMock.mockResolvedValue({
                isFetching,
                isError: false,
                data: null,
            })

            const result =
                await fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                    filters,
                    timeZone,
                    sorting,
                    slaStatus,
                )

            expect(result.isFetching).toEqual(isFetching)
        })

        it('should return error state', async () => {
            const isError = true
            fetchMetricPerDimensionMock.mockResolvedValue({
                isFetching: false,
                isError,
                data: null,
            })

            const result =
                await fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                    filters,
                    timeZone,
                    sorting,
                    slaStatus,
                )

            expect(result.isError).toEqual(isError)
        })
    })
})
