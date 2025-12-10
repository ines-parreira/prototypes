import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { satisfiedOrBreachedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import { satisfiedOrBreachedTicketsQueryV2Factory } from 'domains/reporting/models/scopes/ticketSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

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
        useMetricPerDimensionV2Mock.mockReturnValue(mockData)
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
                undefined,
            )
            expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
                slaStatus,
            )
            expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
                slaStatus,
            )
        })

        it('should return loading state', () => {
            const isFetching = true
            useMetricPerDimensionV2Mock.mockReturnValue({
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
            useMetricPerDimensionV2Mock.mockReturnValue({
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
            fetchMetricPerDimensionV2Mock.mockResolvedValue({
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

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
                undefined,
            )
            expect(fetchMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
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

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                1,
                satisfiedOrBreachedTicketsQueryFactory(
                    filters,
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters,
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
                slaStatus,
            )
            expect(fetchMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
                2,
                satisfiedOrBreachedTicketsQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timeZone,
                    sorting,
                ),
                satisfiedOrBreachedTicketsQueryV2Factory({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone: timeZone,
                    sortDirection: sorting,
                }),
                slaStatus,
            )
        })

        it('should return loading state', async () => {
            const isFetching = true
            fetchMetricPerDimensionV2Mock.mockResolvedValue({
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
            fetchMetricPerDimensionV2Mock.mockResolvedValue({
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
