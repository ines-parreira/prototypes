import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'domains/reporting/hooks/distributions'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { workloadPerChannelDistributionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/workloadPerChannel'
import { workloadTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/workloadTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('distributions', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'UTC'

    const defaultMetricResponse = {
        data: {
            value: null,
            decile: null,
            allData: [],
            allValues: [],
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        useMetricPerDimensionV2Mock.mockReturnValue(defaultMetricResponse)
        fetchMetricPerDimensionV2Mock.mockResolvedValue(
            defaultMetricResponse as any,
        )
    })

    describe('useWorkloadPerChannelDistribution', () => {
        it('should call useMetricPerDimensionV2 with correct queries', () => {
            renderHook(() =>
                useWorkloadPerChannelDistribution(statsFilters, timezone),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                workloadPerChannelDistributionQueryFactory(
                    statsFilters,
                    timezone,
                ),
                workloadTicketsPerChannelQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                undefined,
                undefined,
            )
        })

        it('should pass the enabled query flag', () => {
            const enabled = false
            renderHook(() =>
                useWorkloadPerChannelDistribution(
                    statsFilters,
                    timezone,
                    enabled,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                workloadPerChannelDistributionQueryFactory(
                    statsFilters,
                    timezone,
                ),
                workloadTicketsPerChannelQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                undefined,
                enabled,
            )
        })
    })

    describe('fetchWorkloadPerChannelDistribution', () => {
        it('should call fetchMetricPerDimensionV2 with correct queries', async () => {
            await fetchWorkloadPerChannelDistribution(statsFilters, timezone)

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                workloadPerChannelDistributionQueryFactory(
                    statsFilters,
                    timezone,
                ),
                workloadTicketsPerChannelQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
            )
        })

        it('should transform data with humanized channel labels', async () => {
            const mockResponse = {
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: [
                        { dimension: 'email', value: 100, decile: 0.5 },
                        { dimension: 'chat', value: 50, decile: 0.3 },
                        { dimension: 'api', value: 25, decile: 0.2 },
                    ],
                },
            }
            fetchMetricPerDimensionV2Mock.mockResolvedValue(mockResponse as any)

            const result = await fetchWorkloadPerChannelDistribution(
                statsFilters,
                timezone,
            )

            expect(result.data).toEqual([
                { value: 100, decile: 0.5, label: 'Email' },
                { value: 50, decile: 0.3, label: 'Chat' },
                { value: 25, decile: 0.2, label: 'Api' },
            ])
        })

        it('should handle missing values with defaults', async () => {
            const mockResponse = {
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: [
                        {
                            dimension: 'email',
                            value: undefined,
                            decile: undefined,
                        },
                    ],
                },
            }
            fetchMetricPerDimensionV2Mock.mockResolvedValue(mockResponse as any)

            const result = await fetchWorkloadPerChannelDistribution(
                statsFilters,
                timezone,
            )

            expect(result.data).toEqual([
                { value: 0, decile: 0, label: 'Email' },
            ])
        })

        it('should handle null allValues', async () => {
            const mockResponse = {
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: null,
                },
            }
            fetchMetricPerDimensionV2Mock.mockResolvedValue(mockResponse as any)

            const result = await fetchWorkloadPerChannelDistribution(
                statsFilters,
                timezone,
            )

            expect(result.data).toEqual([])
        })
    })

    describe('useWorkloadPerChannelDistributionForPreviousPeriod', () => {
        it('should call useMetricPerDimensionV2 with previous period filters', () => {
            renderHook(() =>
                useWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                ),
            )

            const previousPeriodFilters = {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            }

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                workloadPerChannelDistributionQueryFactory(
                    previousPeriodFilters,
                    timezone,
                ),
                workloadTicketsPerChannelQueryV2Factory({
                    filters: previousPeriodFilters,
                    timezone,
                }),
                undefined,
                undefined,
            )
        })

        it('should pass the enabled query flag', () => {
            const enabled = true
            renderHook(() =>
                useWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                    enabled,
                ),
            )

            const previousPeriodFilters = {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            }

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                workloadPerChannelDistributionQueryFactory(
                    previousPeriodFilters,
                    timezone,
                ),
                workloadTicketsPerChannelQueryV2Factory({
                    filters: previousPeriodFilters,
                    timezone,
                }),
                undefined,
                enabled,
            )
        })
    })

    describe('fetchWorkloadPerChannelDistributionForPreviousPeriod', () => {
        it('should call fetchMetricPerDimensionV2 with previous period filters', async () => {
            await fetchWorkloadPerChannelDistributionForPreviousPeriod(
                statsFilters,
                timezone,
            )

            const previousPeriodFilters = {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            }

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                workloadPerChannelDistributionQueryFactory(
                    previousPeriodFilters,
                    timezone,
                ),
                workloadTicketsPerChannelQueryV2Factory({
                    filters: previousPeriodFilters,
                    timezone,
                }),
            )
        })

        it('should transform data with humanized channel labels', async () => {
            const mockResponse = {
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: [
                        { dimension: 'phone', value: 75, decile: 0.4 },
                        { dimension: 'facebook', value: 30, decile: 0.15 },
                    ],
                },
            }
            fetchMetricPerDimensionV2Mock.mockResolvedValue(mockResponse as any)

            const result =
                await fetchWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                )

            expect(result.data).toEqual([
                { value: 75, decile: 0.4, label: 'Phone' },
                { value: 30, decile: 0.15, label: 'Facebook' },
            ])
        })

        it('should handle empty allValues array', async () => {
            const mockResponse = {
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: [],
                },
            }
            fetchMetricPerDimensionV2Mock.mockResolvedValue(mockResponse as any)

            const result =
                await fetchWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                )

            expect(result.data).toEqual([])
        })
    })
})
