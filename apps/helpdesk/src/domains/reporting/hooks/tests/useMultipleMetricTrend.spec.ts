import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'domains/reporting/hooks/useMultipleMetricsTrend'
import type { AutomationDatasetCube } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'

jest.mock('domains/reporting/models/queries')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
const usePostReportingV2Mock = assumeMock(usePostReportingV2)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)
const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)

describe('MultipleMetricTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const defaultQuery: ReportingQuery<AutomationDatasetCube> = {
        measures: [
            AutomationDatasetMeasure.AutomatedInteractions,
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
        ],
        dimensions: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
    }

    describe('useMultipleMetricTrend', () => {
        beforeEach(() => {
            usePostReportingV2Mock.mockReturnValue(defaultReporting)
        })

        it('should return isFetching=false when no queries are fetching', () => {
            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.isFetching).toBe(false)
        })

        it('should return isFetching=true when one the queries is fetching', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                isFetching: true,
            })

            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should return isError=false when no queries errored', () => {
            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.isError).toBe(false)
        })

        it('should return isError=true when one the queries errored', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                isError: true,
            } as UseQueryResult)

            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.isError).toBe(true)
        })

        it('should return empty data when the queries does not have data', () => {
            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    prevValue: null,
                    value: null,
                },
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                    {
                        prevValue: null,
                        value: null,
                    },
            })
        })

        it('should return data value', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                },
            } as UseQueryResult)
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            } as UseQueryResult)

            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    prevValue: null,
                    value: 10,
                    rawData: {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                    },
                },
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                    {
                        prevValue: null,
                        value: 11,
                        rawData: {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                        },
                    },
            })
        })
        it('should return data value and prevValue', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                },
            } as UseQueryResult)
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 20,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 21,
                },
            } as UseQueryResult)

            const { result } = renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    prevValue: 20,
                    value: 10,
                    rawData: {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                    },
                },
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                    {
                        prevValue: 21,
                        value: 11,
                        rawData: {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                        },
                    },
            })
        })

        it('should call usePostReporting with the query', () => {
            const data = {
                data: {
                    data: [
                        {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                            rawData: {
                                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                            },
                        },
                    ],
                },
            } as any

            const prevPeriodQuery = {
                ...defaultQuery,
                measures: [
                    AutomationDatasetMeasure.AutomatedInteractions,
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                ],
            }
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                },
            } as UseQueryResult)
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 20,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 21,
                },
            } as UseQueryResult)

            renderHook(() =>
                useMultipleMetricsTrends(defaultQuery, prevPeriodQuery),
            )

            const defaultSelect =
                usePostReportingV2Mock.mock.calls[0][2]?.select
            const previousSelect =
                usePostReportingV2Mock.mock.calls[1][2]?.select

            expect(usePostReportingV2Mock).toHaveBeenCalledWith(
                [defaultQuery],
                undefined,
                expect.objectContaining({
                    select: defaultSelect,
                }),
            )
            expect(defaultSelect?.(data)).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                rawData: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                },
            })

            expect(usePostReportingV2Mock).toHaveBeenCalledWith(
                [prevPeriodQuery],
                undefined,
                expect.objectContaining({
                    select: usePostReportingV2Mock.mock.calls[1][2]?.select,
                }),
            )
            expect(previousSelect?.(data)).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                rawData: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                },
            })
        })
    })

    describe('fetchMultipleMetricTrend', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
            fetchPostReportingV2Mock.mockReturnValue({
                ...defaultReporting,
                data: {
                    data: [],
                },
            } as any)
        })

        it('should return isError=false when no queries errored', async () => {
            const result = await fetchMultipleMetricsTrends(
                defaultQuery,
                defaultQuery,
            )

            expect(result.isError).toBe(false)
        })

        it('should return isError=true when one the queries errored', async () => {
            fetchPostReportingV2Mock.mockRejectedValue({
                ...defaultReporting,
                isError: true,
            } as any)

            const result = await fetchMultipleMetricsTrends(
                defaultQuery,
                defaultQuery,
            )

            expect(result.isError).toBe(true)
        })

        it('should return empty data when the queries does not have data', async () => {
            const result = await fetchMultipleMetricsTrends(
                defaultQuery,
                defaultQuery,
            )

            expect(result.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    prevValue: null,
                    value: null,
                    rawData: undefined,
                },
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                    {
                        prevValue: null,
                        value: null,
                        rawData: undefined,
                    },
            })
        })

        it('should return data value', async () => {
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    data: [
                        {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                            rawData: {
                                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                            },
                        },
                    ],
                },
            } as any)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    data: [],
                },
            } as any)

            const result = await fetchMultipleMetricsTrends(
                defaultQuery,
                defaultQuery,
            )

            expect(result.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    prevValue: null,
                    value: 10,
                    rawData: {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                        rawData: {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                        },
                    },
                },
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                    {
                        prevValue: null,
                        value: 11,
                        rawData: {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                            rawData: {
                                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                            },
                        },
                    },
            })
        })

        it('should return data value and prevValue', async () => {
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    data: [
                        {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                        },
                    ],
                },
            } as any)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    data: [
                        {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 20,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 21,
                        },
                    ],
                },
            } as any)

            const result = await fetchMultipleMetricsTrends(
                defaultQuery,
                defaultQuery,
            )

            expect(result.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    prevValue: 20,
                    value: 10,
                    rawData: {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                    },
                },
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                    {
                        prevValue: 21,
                        value: 11,
                        rawData: {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                        },
                    },
            })
        })

        it('should use V2 measures when migration stage is complete and V2 query is provided', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('complete')
            const currentPeriodQueryV2 = {
                ...defaultQuery,
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                scope: 'test-scope',
            } as any

            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    data: [
                        {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 42,
                            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 99,
                        },
                    ],
                },
            } as any)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    data: [
                        {
                            [AutomationDatasetMeasure.AutomatedInteractions]: 21,
                        },
                    ],
                },
            } as any)

            const result = await fetchMultipleMetricsTrends(
                defaultQuery,
                defaultQuery,
                currentPeriodQueryV2,
                currentPeriodQueryV2,
            )

            expect(result.data).toEqual({
                [AutomationDatasetMeasure.AutomatedInteractions]: {
                    value: 42,
                    prevValue: 21,
                    rawData: {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 42,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 99,
                    },
                },
            })
            expect(result.data).not.toHaveProperty(
                AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            )
        })

        it('should call fetchPostReporting with the query', async () => {
            const prevPeriodQuery = {
                ...defaultQuery,
                measures: [
                    AutomationDatasetMeasure.AutomatedInteractions,
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                ],
            }
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                    rawData: {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                    },
                },
            } as any)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                ...defaultReporting,
                data: {
                    [AutomationDatasetMeasure.AutomatedInteractions]: 20,
                    [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 21,
                },
            } as any)

            await fetchMultipleMetricsTrends(defaultQuery, prevPeriodQuery)

            expect(fetchPostReportingV2Mock).toHaveBeenCalledWith(
                [defaultQuery],
                undefined,
            )
            expect(fetchPostReportingV2Mock).toHaveBeenCalledWith(
                [prevPeriodQuery],
                undefined,
            )
        })
    })
})
