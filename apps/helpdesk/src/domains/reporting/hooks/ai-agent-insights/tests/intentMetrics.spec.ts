import { assumeMock, renderHook } from '@repo/testing'

import {
    useHandoverInteractionsPerIntent,
    useSnoozedInteractionsPerIntent,
    useTotalInteractionsPerIntent,
} from 'domains/reporting/hooks/ai-agent-insights/intentMetrics'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    handoverInteractionsPerIntentQueryFactory,
    snoozedInteractionsPerIntentQueryFactory,
    totalInteractionsPerIntentQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/intentMetrics'

jest.mock('domains/reporting/hooks/useMetricPerDimension')

const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('Intent Metrics Hooks', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const outcomeCustomFieldId = 5254
    const intentCustomFieldId = 5253

    beforeEach(() => {
        useMetricPerDimensionMock.mockClear()
    })

    describe('useHandoverInteractionsPerIntent', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () =>
                    useHandoverInteractionsPerIntent(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        intentCustomFieldId,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                handoverInteractionsPerIntentQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                    intentCustomFieldId,
                ),
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
                    useHandoverInteractionsPerIntent(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        intentCustomFieldId,
                    ),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('useSnoozedInteractionsPerIntent', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () =>
                    useSnoozedInteractionsPerIntent(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        intentCustomFieldId,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                snoozedInteractionsPerIntentQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                    intentCustomFieldId,
                ),
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
                    useSnoozedInteractionsPerIntent(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        intentCustomFieldId,
                    ),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('useTotalInteractionsPerIntent', () => {
        it('should call useMetricPerDimension with correct query', () => {
            renderHook(
                () =>
                    useTotalInteractionsPerIntent(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        intentCustomFieldId,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                totalInteractionsPerIntentQueryFactory(
                    filters,
                    timezone,
                    outcomeCustomFieldId,
                    intentCustomFieldId,
                ),
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
                    useTotalInteractionsPerIntent(
                        filters,
                        timezone,
                        outcomeCustomFieldId,
                        intentCustomFieldId,
                    ),
                {},
            )

            expect(result.current).toEqual(mockResult)
        })
    })
})
