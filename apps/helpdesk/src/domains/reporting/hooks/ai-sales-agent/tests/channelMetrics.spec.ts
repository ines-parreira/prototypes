import { assumeMock, renderHook } from '@repo/testing'

import {
    useAutomatedSalesConversationsPerChannel,
    useGmvInfluencedPerChannel,
    useHandoverInteractionsPerChannel,
    useSnoozedInteractionsPerChannel,
    useTotalSalesConversationsPerChannel,
} from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import {
    useMetricPerDimension,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    automatedSalesConversationsPerChannelQueryFactory,
    gmvInfluencedPerChannelQueryFactory,
    handoverInteractionsPerChannelQueryFactory,
    snoozedInteractionsPerChannelQueryFactory,
    totalSalesConversationsPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/channelMetrics'
import { AISalesAgentGMVInfluencedPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'

jest.mock('domains/reporting/hooks/useMetricPerDimension')

const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)

describe('Channel Metrics Hooks', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const outcomeCustomFieldId = 5254
    const channel = 'email'

    beforeEach(() => {
        useMetricPerDimensionMock.mockClear()
    })

    describe('useHandoverInteractionsPerChannel', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () =>
                    useHandoverInteractionsPerChannel(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                handoverInteractionsPerChannelQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                ),
                undefined,
            )
        })

        it('should pass channel parameter when provided', () => {
            renderHook(
                () =>
                    useHandoverInteractionsPerChannel(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        channel,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                handoverInteractionsPerChannelQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                ),
                channel,
            )
        })

        it('should return the result from useMetricPerDimension', () => {
            const mockResult = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as unknown as MetricWithDecile
            useMetricPerDimensionMock.mockReturnValue(mockResult)

            const { result } = renderHook(
                () =>
                    useHandoverInteractionsPerChannel(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                    ),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('useSnoozedInteractionsPerChannel', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () =>
                    useSnoozedInteractionsPerChannel(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                snoozedInteractionsPerChannelQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                ),
                undefined,
            )
        })

        it('should pass channel parameter when provided', () => {
            renderHook(
                () =>
                    useSnoozedInteractionsPerChannel(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        channel,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                snoozedInteractionsPerChannelQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                ),
                channel,
            )
        })

        it('should return the result from useMetricPerDimension', () => {
            const mockResult = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as unknown as MetricWithDecile
            useMetricPerDimensionMock.mockReturnValue(mockResult)

            const { result } = renderHook(
                () =>
                    useSnoozedInteractionsPerChannel(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                    ),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('useGmvInfluencedPerChannel', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(() => useGmvInfluencedPerChannel(filters, timezone), {})

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                gmvInfluencedPerChannelQueryFactory(filters, timezone),
                AISalesAgentGMVInfluencedPerChannelQueryFactoryV2({
                    filters,
                    timezone,
                }),
                undefined,
            )
        })

        it('should pass channel parameter when provided', () => {
            renderHook(
                () => useGmvInfluencedPerChannel(filters, timezone, channel),
                {},
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                gmvInfluencedPerChannelQueryFactory(filters, timezone),
                AISalesAgentGMVInfluencedPerChannelQueryFactoryV2({
                    filters,
                    timezone,
                }),
                channel,
            )
        })

        it('should return the result from useMetricPerDimension', () => {
            const mockResult = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as unknown as MetricWithDecile<string, any>
            useMetricPerDimensionV2Mock.mockReturnValue(mockResult)

            const { result } = renderHook(
                () => useGmvInfluencedPerChannel(filters, timezone),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('useTotalSalesConversationsPerChannel', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () => useTotalSalesConversationsPerChannel(filters, timezone),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                totalSalesConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                ),
                undefined,
            )
        })

        it('should pass channel parameter when provided', () => {
            renderHook(
                () =>
                    useTotalSalesConversationsPerChannel(
                        filters,
                        timezone,
                        channel,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                totalSalesConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                ),
                channel,
            )
        })

        it('should return the result from useMetricPerDimension', () => {
            const mockResult = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as unknown as MetricWithDecile
            useMetricPerDimensionMock.mockReturnValue(mockResult)

            const { result } = renderHook(
                () => useTotalSalesConversationsPerChannel(filters, timezone),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('useAutomatedSalesConversationsPerChannel', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () =>
                    useAutomatedSalesConversationsPerChannel(filters, timezone),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                automatedSalesConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                ),
                undefined,
            )
        })

        it('should pass channel parameter when provided', () => {
            renderHook(
                () =>
                    useAutomatedSalesConversationsPerChannel(
                        filters,
                        timezone,
                        channel,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                automatedSalesConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                ),
                channel,
            )
        })

        it('should return the result from useMetricPerDimension', () => {
            const mockResult = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as unknown as MetricWithDecile
            useMetricPerDimensionMock.mockReturnValue(mockResult)

            const { result } = renderHook(
                () =>
                    useAutomatedSalesConversationsPerChannel(filters, timezone),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })
})
