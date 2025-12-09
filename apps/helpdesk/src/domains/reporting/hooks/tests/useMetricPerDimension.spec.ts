import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import type { MigrationStage } from 'core/flags/utils/readMigration'
import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defaultEnrichmentFields } from 'domains/reporting/hooks/useDrillDownData'
import type {
    QueryReturnType,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    fetchMetricPerDimension,
    fetchMetricPerDimensionV2,
    fetchMetricPerDimensionWithEnrichment,
    selectMeasurePerDimension,
    useMetricPerDimension,
    useMetricPerDimensionV2,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { withEnrichment } from 'domains/reporting/hooks/withEnrichment'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import type { TicketMessagesCube } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketsFirstAgentResponseTimeDimension,
    TicketsFirstAgentResponseTimeMeasure,
} from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import {
    fetchPostReporting,
    fetchPostReportingV2,
    useEnrichedPostReporting,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { medianFirstAgentResponseTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { postEnrichedReporting } from 'domains/reporting/models/resources'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const usePostReportingMockV2 = assumeMock(usePostReportingV2)
const fetchPostReportingMock = assumeMock(fetchPostReporting)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)
jest.mock('domains/reporting/models/resources')
const useEnrichedPostReportingMock = assumeMock(useEnrichedPostReporting)
const postEnrichedReportingMock = assumeMock(postEnrichedReporting)

jest.mock('domains/reporting/hooks/withEnrichment')
const withEnrichmentMock = assumeMock(withEnrichment)

jest.mock('domains/reporting/utils/metricExecutionHandler')

jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
const useGetNewStatsFeatureFlagMigrationMock = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)

describe('MetricPerDimension', () => {
    const query: ReportingQuery<TicketCubeWithJoins> =
        medianFirstAgentResponseTimePerAgentQueryFactory(
            {
                period: {
                    start_datetime: '2020-01-16T03:04:56.789-10:00',
                    end_datetime: '2020-01-02T03:04:56.789-10:00',
                },
            },
            'timezone',
        )
    const testScopeMeta = {
        scope: 'test-scope' as any,
        filters: ['periodStart', 'periodEnd'] as const,
        measures: ['medianFirstResponseTime'] as const,
        dimensions: ['agentId'] as const,
        timeDimensions: ['createdDatetime'] as const,
    } as const satisfies ScopeMeta

    const queryV2: BuiltQuery<typeof testScopeMeta> = {
        metricName: METRIC_NAMES.TEST_METRIC,
        scope: MetricScope.SatisfactionSurveys,
        measures: ['medianFirstResponseTime'],
        dimensions: ['agentId'],
    }

    const agentId = 456
    const metricValue = 4567

    const data = Array.from(Array(150).keys()).map((index) => ({
        [TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId]:
            String(agentId + index),
        [TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime]:
            String(metricValue + index),
    }))

    const mockedResponse: UseQueryResult<
        QueryReturnType<ReportingMetricItemValue, TicketMessagesCube>
    > = {
        isFetching: false,
        isError: false,
        data: data,
    } as unknown as UseQueryResult<
        QueryReturnType<ReportingMetricItemValue, TicketMessagesCube>
    >

    describe('useMetricPerDimension', () => {
        function mockUsePostReporting(response: any) {
            const mockedClientResponse = {
                data: {
                    data: response.data,
                },
            } as any

            usePostReportingMock.mockImplementation((_, overrides) => ({
                ...response,
                data: overrides!.select!(mockedClientResponse),
            }))
        }

        it('should usePostReporting with query and select', () => {
            mockUsePostReporting(mockedResponse)

            const { result } = renderHook(() =>
                useMetricPerDimension(query, String(agentId)),
            )

            expect(result.current).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    value: metricValue,
                    allData: mockedResponse.data,
                    allValues: expect.arrayContaining([
                        expect.objectContaining({
                            dimension: expect.any(String),
                            value: expect.any(Number),
                        }),
                    ]),
                    decile: null,
                    dimensions: query.dimensions,
                    measures: query.measures,
                },
            })
        })

        it('should return null when data not available for entity id', () => {
            const agentId = 'notInResponse'
            mockUsePostReporting(mockedResponse)

            const { result } = renderHook(() =>
                useMetricPerDimension(query, agentId),
            )

            expect(result.current?.data?.value).toBeNull()
        })

        it('should return null when called without entity', () => {
            mockUsePostReporting(mockedResponse)

            const { result } = renderHook(() => useMetricPerDimension(query))

            expect(result.current?.data?.value).toBeNull()
        })

        it('should return null when no data in response', () => {
            const agentIdNotInResponse = 'notInResponse'
            mockUsePostReporting({
                ...mockedResponse,
                data: undefined,
            })

            const { result } = renderHook(() =>
                useMetricPerDimension(query, agentIdNotInResponse),
            )

            expect(result.current?.data).toEqual({
                value: null,
                decile: null,
                allData: [],
                allValues: [],
                dimensions: query.dimensions,
                measures: query.measures,
            })
        })

        it('should use the select function', () => {
            mockUsePostReporting(mockedResponse)

            const { result } = renderHook(() =>
                useMetricPerDimension(query, String(agentId)),
            )

            expect(result.current?.data?.allData).toEqual(mockedResponse.data)
        })
    })

    const decileValue = 5
    const dataWithDeciles = Array.from(Array(150).keys()).map((index) => ({
        [TicketMessagesDimension.FirstHelpdeskMessageUserId]: String(
            agentId + index,
        ),
        [TicketMessagesMeasure.MedianFirstResponseTime]: String(
            metricValue + index,
        ),
        decile: String(decileValue + index),
    }))

    const mockedResponseWithDeciles: UseQueryResult<
        QueryReturnType<ReportingMetricItemValue, TicketMessagesCube>
    > = {
        isFetching: false,
        isError: false,
        data: dataWithDeciles,
    } as unknown as UseQueryResult<
        QueryReturnType<ReportingMetricItemValue, TicketMessagesCube>
    >

    describe('useMetricPerDimensionV2', () => {
        beforeEach(() => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'off' as MigrationStage,
            )
            jest.clearAllMocks()
        })

        it('should return metric data with value and decile when dimensionId is provided', () => {
            const mockResponse = {
                ...mockedResponseWithDeciles,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            }

            usePostReportingMockV2.mockReturnValue(mockResponse as any)

            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(result.current).toEqual({
                isFetching: mockedResponseWithDeciles.isFetching,
                isError: mockedResponseWithDeciles.isError,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            })
        })

        it('should return null values when dimensionId is not found in data', () => {
            const agentId = 'notInResponse'
            const mockResponse = {
                ...mockedResponseWithDeciles,
                data: {
                    value: null,
                    decile: null,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            }

            usePostReportingMockV2.mockReturnValue(mockResponse as any)

            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, agentId),
            )

            expect(result.current?.data?.value).toBeNull()
            expect(result.current?.data?.decile).toBeNull()
        })

        it('should return null values when dimensionId is not provided', () => {
            const mockResponse = {
                ...mockedResponseWithDeciles,
                data: {
                    value: null,
                    decile: null,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            }

            usePostReportingMockV2.mockReturnValue(mockResponse as any)

            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, queryV2),
            )

            expect(result.current).toEqual({
                isFetching: mockedResponseWithDeciles.isFetching,
                isError: mockedResponseWithDeciles.isError,
                data: {
                    value: null,
                    decile: null,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            })
        })

        it('should handle loading state', () => {
            const mockResponse = {
                ...mockedResponseWithDeciles,
                isFetching: true,
                isError: false,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                },
            }
            usePostReportingMockV2.mockReturnValue(mockResponse as any)

            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.isError).toBe(false)
        })

        it('should handle error state', () => {
            const mockResponse = {
                ...mockedResponseWithDeciles,
                isFetching: false,
                isError: true,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                },
            }
            usePostReportingMockV2.mockReturnValue(mockResponse as any)

            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(result.current.isFetching).toBe(false)
            expect(result.current.isError).toBe(true)
        })
    })

    describe('useMetricPerDimensionV2 with migration stage complete or live', () => {
        beforeEach(() => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'complete' as MigrationStage,
            )

            const mockResponse = {
                ...mockedResponseWithDeciles,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            }

            usePostReportingMockV2.mockReturnValue(mockResponse as any)
        })

        it('should return metric data with value and decile when dimensionId is provided and migration stage is complete or live', () => {
            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(result.current).toEqual({
                isFetching: mockedResponseWithDeciles.isFetching,
                isError: mockedResponseWithDeciles.isError,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            })
        })

        it('should not use queryV2 when migration stage is complete or live if its is not provided', () => {
            const mockResponseWithoutV2 = {
                ...mockedResponseWithDeciles,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: query.dimensions,
                    measures: query.measures,
                },
            }

            usePostReportingMockV2.mockReturnValue(mockResponseWithoutV2 as any)

            const { result } = renderHook(() =>
                useMetricPerDimensionV2(query, undefined, String(agentId)),
            )

            expect(result.current).toEqual({
                isFetching: mockedResponseWithDeciles.isFetching,
                isError: mockedResponseWithDeciles.isError,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    dimensions: query.dimensions,
                    measures: query.measures,
                },
            })
        })
    })

    describe('useMetricPerDimensionV2 select function (line 231)', () => {
        const dimensionKey =
            TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId
        const measureKey =
            TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should call selectMeasurePerDimension with correct parameters when migration stage is off', () => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'off' as MigrationStage,
            )

            let capturedSelect: ((data: any) => any) | undefined
            const testData = [
                {
                    [dimensionKey]: String(agentId),
                    [measureKey]: String(metricValue),
                    decile: String(decileValue),
                },
            ]

            usePostReportingMockV2.mockImplementation((_, __, options) => {
                capturedSelect = options?.select
                return {
                    isFetching: false,
                    isError: false,
                    data: null,
                } as any
            })

            renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(capturedSelect).toBeDefined()
            if (capturedSelect) {
                const result = capturedSelect({
                    data: {
                        data: testData,
                    },
                })

                expect(result).toEqual({
                    value: metricValue,
                    decile: decileValue,
                    allData: testData,
                    allValues: [
                        {
                            dimension: String(agentId),
                            value: metricValue,
                            decile: decileValue,
                        },
                    ],
                    dimensions: query.dimensions,
                    measures: query.measures,
                })
            }
        })

        it('should call selectMeasurePerDimension with isV2=true when migration stage is complete', () => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'complete' as MigrationStage,
            )

            let capturedSelect: ((data: any) => any) | undefined
            const testData = [
                {
                    agentId: String(agentId),
                    medianFirstResponseTime: String(metricValue),
                    decile: String(decileValue),
                },
            ]

            usePostReportingMockV2.mockImplementation((_, __, options) => {
                capturedSelect = options?.select
                return {
                    isFetching: false,
                    isError: false,
                    data: null,
                } as any
            })

            renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(capturedSelect).toBeDefined()
            if (capturedSelect) {
                const result = capturedSelect({
                    data: {
                        data: testData,
                    },
                })

                expect(result).toEqual({
                    value: metricValue,
                    decile: decileValue,
                    allData: testData,
                    allValues: [
                        {
                            dimension: String(agentId),
                            value: metricValue,
                            decile: decileValue,
                        },
                    ],
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                })
            }
        })

        it('should call selectMeasurePerDimension with isV2=true when migration stage is live', () => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'live' as MigrationStage,
            )

            let capturedSelect: ((data: any) => any) | undefined
            const testData = [
                {
                    agentId: String(agentId),
                    medianFirstResponseTime: String(metricValue),
                    decile: String(decileValue),
                },
            ]

            usePostReportingMockV2.mockImplementation((_, __, options) => {
                capturedSelect = options?.select
                return {
                    isFetching: false,
                    isError: false,
                    data: null,
                } as any
            })

            renderHook(() =>
                useMetricPerDimensionV2(query, queryV2, String(agentId)),
            )

            expect(capturedSelect).toBeDefined()
            if (capturedSelect) {
                const result = capturedSelect({
                    data: {
                        data: testData,
                    },
                })

                expect(result).toEqual({
                    value: metricValue,
                    decile: decileValue,
                    allData: testData,
                    allValues: [
                        {
                            dimension: String(agentId),
                            value: metricValue,
                            decile: decileValue,
                        },
                    ],
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                })
            }
        })

        it('should pass correct parameters to selectMeasurePerDimension including dimensionId', () => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'off' as MigrationStage,
            )

            let capturedSelect: ((data: any) => any) | undefined
            const testData = [
                {
                    [dimensionKey]: '123',
                    [measureKey]: '100',
                    decile: '1',
                },
                {
                    [dimensionKey]: '456',
                    [measureKey]: '200',
                    decile: '2',
                },
            ]

            usePostReportingMockV2.mockImplementation((_, __, options) => {
                capturedSelect = options?.select
                return {
                    isFetching: false,
                    isError: false,
                    data: null,
                } as any
            })

            renderHook(() => useMetricPerDimensionV2(query, queryV2, '456'))

            expect(capturedSelect).toBeDefined()
            if (capturedSelect) {
                const result = capturedSelect({
                    data: {
                        data: testData,
                    },
                })

                expect(result).toEqual({
                    value: 200,
                    decile: 2,
                    allData: testData,
                    allValues: [
                        {
                            dimension: '123',
                            value: 100,
                            decile: 1,
                        },
                        {
                            dimension: '456',
                            value: 200,
                            decile: 2,
                        },
                    ],
                    dimensions: query.dimensions,
                    measures: query.measures,
                })
            }
        })
    })

    describe('fetchMetricPerDimension', () => {
        it('should fetchPostReporting with query and select', async () => {
            fetchPostReportingMock.mockResolvedValue({
                data: mockedResponse,
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchMetricPerDimension(query, String(agentId))

            expect(result).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    value: metricValue,
                    allData: mockedResponse.data,
                    allValues: expect.arrayContaining([
                        expect.objectContaining({
                            dimension: expect.any(String),
                            value: expect.any(Number),
                        }),
                    ]),
                    decile: null,
                    dimensions: query.dimensions,
                    measures: query.measures,
                },
            })
        })

        it('should return null when data not available for entity id', async () => {
            const agentId = 'notInResponse'
            fetchPostReportingMock.mockResolvedValue({
                data: mockedResponse,
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchMetricPerDimension(query, agentId)

            expect(result?.data?.value).toBeNull()
        })

        it('should return null when called without entity', async () => {
            fetchPostReportingMock.mockResolvedValue({
                data: mockedResponse,
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchMetricPerDimension(query)

            expect(result?.data?.value).toBeNull()
        })

        it('should return null when no data in response', async () => {
            const agentIdNotInResponse = 'notInResponse'
            fetchPostReportingMock.mockRejectedValue({
                ...mockedResponse,
                data: { data: undefined },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchMetricPerDimension(
                query,
                agentIdNotInResponse,
            )

            expect(result?.data).toBeNull()
        })

        it('should return null on error', async () => {
            const agentIdNotInResponse = 'notInResponse'
            fetchPostReportingMock.mockRejectedValue(
                {} as unknown as ReturnType<typeof fetchPostReporting>,
            )

            const result = await fetchMetricPerDimension(
                query,
                agentIdNotInResponse,
            )

            expect(result?.data).toEqual(null)
        })
    })

    describe('fetchMetricPerDimensionV2', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockReturnValue(
                Promise.resolve('complete' as MigrationStage),
            )
        })

        const decileValue = 5

        const dataWithDeciles = Array.from(Array(150).keys()).map((index) => ({
            ['agentId']: String(agentId + index),
            ['medianFirstResponseTime']: String(metricValue + index),
            decile: String(decileValue + index),
        }))

        const mockedResponseWithDeciles = {
            isFetching: false,
            isError: false,
            data: dataWithDeciles,
        }

        it('should fetchPostReportingV2 with V2 query and return data with decile', async () => {
            fetchPostReportingV2Mock.mockResolvedValue({
                data: mockedResponseWithDeciles,
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchMetricPerDimensionV2(
                query,
                queryV2,
                String(agentId),
            )

            expect(result).toEqual({
                isFetching: mockedResponseWithDeciles.isFetching,
                isError: mockedResponseWithDeciles.isError,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
                    allValues: expect.arrayContaining([
                        expect.objectContaining({
                            dimension: expect.any(String),
                            value: expect.any(Number),
                            decile: expect.any(Number),
                        }),
                    ]),
                    dimensions: queryV2.dimensions,
                    measures: queryV2.measures,
                },
            })
        })

        it('should work without V2 query', async () => {
            fetchPostReportingV2Mock.mockResolvedValue({
                data: mockedResponse,
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchMetricPerDimensionV2(
                query,
                undefined,
                String(agentId),
            )

            expect(result).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    value: metricValue,
                    decile: null,
                    allData: mockedResponse.data,
                    allValues: expect.arrayContaining([
                        expect.objectContaining({
                            dimension: expect.any(String),
                            value: expect.any(Number),
                        }),
                    ]),
                    dimensions: query.dimensions,
                    measures: query.measures,
                },
            })
        })

        it('should return null when data not available for entity id', async () => {
            const agentIdNotInResponse = 'notInResponse'
            fetchPostReportingV2Mock.mockResolvedValue({
                data: mockedResponseWithDeciles,
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchMetricPerDimensionV2(
                query,
                queryV2,
                agentIdNotInResponse,
            )

            expect(result?.data?.value).toBeNull()
            expect(result?.data?.decile).toBeNull()
        })

        it('should return null when called without entity', async () => {
            fetchPostReportingV2Mock.mockResolvedValue({
                data: mockedResponseWithDeciles,
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchMetricPerDimensionV2(query, queryV2)

            expect(result?.data?.value).toBeNull()
            expect(result?.data?.decile).toBeNull()
        })

        it('should return null on error', async () => {
            const agentIdNotInResponse = 'notInResponse'
            fetchPostReportingV2Mock.mockRejectedValue(
                {} as unknown as ReturnType<typeof fetchPostReportingV2>,
            )

            const result = await fetchMetricPerDimensionV2(
                query,
                queryV2,
                agentIdNotInResponse,
            )

            expect(result?.data).toEqual(null)
        })
    })
})

describe('useMetricPerDimensionWithEnrichment', () => {
    function mockUseEnrichedPostReporting(response: any) {
        const mockedClientResponse = {
            data: response.data,
        } as any

        useEnrichedPostReportingMock.mockImplementation((_, overrides) => ({
            ...response,
            data: overrides!.select!(mockedClientResponse),
        }))
    }

    it('should send a query with custom queryFn', async () => {
        const timezone = 'America'
        const statsFilters = {
            period: {
                start_datetime: '2020-01-16T03:04:56.789-10:00',
                end_datetime: '2020-01-02T03:04:56.789-10:00',
            },
        }
        const query = messagesSentMetricPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
        )
        const results = [
            { [EnrichmentFields.TicketId]: 1, metric: 123 },
            { [EnrichmentFields.TicketId]: 2, metric: 456 },
            { [EnrichmentFields.TicketId]: 3, metric: 789 },
            { [EnrichmentFields.TicketId]: 4, metric: 369 },
            { [EnrichmentFields.TicketId]: 5, metric: 529 },
        ]
        const enrichments = [
            {
                [EnrichmentFields.TicketId]: 1,
                [EnrichmentFields.Status]: 'open',
                [EnrichmentFields.Description]: 'Kowalski',
            },
            {
                [EnrichmentFields.TicketId]: 2,
                [EnrichmentFields.Status]: 'open',
                [EnrichmentFields.Description]: 'Petrović',
            },
            {
                [EnrichmentFields.TicketId]: 3,
                [EnrichmentFields.Status]: 'closed',
                [EnrichmentFields.Description]: 'Dupont',
            },
            {
                [EnrichmentFields.TicketId]: 4,
                [EnrichmentFields.Description]: null,
            },
        ]
        const mockedResponse = {
            isFetching: false,
            isError: false,
            data: {
                data: results,
                enrichment: enrichments,
            },
        }
        mockUseEnrichedPostReporting(mockedResponse)
        postEnrichedReportingMock.mockResolvedValue(mockedResponse as any)

        const { result } = renderHook(() =>
            useMetricPerDimensionWithEnrichment(
                query,
                defaultEnrichmentFields,
                EnrichmentFields.TicketId,
            ),
        )

        const queryFunction =
            useEnrichedPostReportingMock.mock.calls[0][1]?.queryFn

        await queryFunction?.({} as any)

        await waitFor(() => {
            expect(useEnrichedPostReportingMock).toHaveBeenCalledWith(
                { query, enrichment_fields: defaultEnrichmentFields },
                {
                    select: expect.any(Function),
                    queryFn: expect.any(Function),
                },
            )
            expect(result.current).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    value: null,
                    allData: results,
                },
            })
            expect(withEnrichmentMock).toHaveBeenCalledWith(
                mockedResponse,
                query.dimensions[0],
                defaultEnrichmentFields,
                EnrichmentFields.TicketId,
            )
        })
    })
})

describe('fetchMetricPerDimensionWithEnrichment', () => {
    const mockQuery = {
        measures: ['testMeasure'],
        dimensions: ['testDimension'],
    }
    const mockEnrichmentFields = [EnrichmentFields.AssigneeName]
    const mockEnrichmentIdField = EnrichmentFields.TicketId

    const mockApiResponse = {
        data: [
            { testMeasure: '100', testDimension: '1' },
            { testMeasure: '200', testDimension: '2' },
        ],
        enrichment: [
            { testDimension: '1', extraInfo: 'Info 1' },
            { testDimension: '2', extraInfo: 'Info 2' },
        ],
    }

    const mockEnrichedData = {
        data: {
            data: [{ testMeasure: '100', testDimension: '1', enriched: true }],
        },
    }
    it('should fetch and return enriched data successfully', async () => {
        postEnrichedReportingMock.mockResolvedValue(mockApiResponse as any)
        withEnrichmentMock.mockReturnValue(mockEnrichedData as any)

        const result = await fetchMetricPerDimensionWithEnrichment(
            mockQuery as any,
            mockEnrichmentFields,
            mockEnrichmentIdField,
        )

        expect(postEnrichedReportingMock).toHaveBeenCalledWith(
            mockQuery,
            mockEnrichmentFields,
        )
        expect(withEnrichmentMock).toHaveBeenCalledWith(
            mockApiResponse,
            'testDimension',
            mockEnrichmentFields,
            mockEnrichmentIdField,
        )
        expect(result).toEqual({
            data: {
                allData: mockEnrichedData.data.data,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should handle API failure and return an error state', async () => {
        postEnrichedReportingMock.mockRejectedValue(new Error('API Error'))

        const result = await fetchMetricPerDimensionWithEnrichment(
            mockQuery as any,
            mockEnrichmentFields,
            mockEnrichmentIdField,
        )

        expect(postEnrichedReportingMock).toHaveBeenCalledWith(
            mockQuery,
            mockEnrichmentFields,
        )
        expect(result).toEqual({
            data: null,
            isFetching: false,
            isError: true,
        })
    })
})
describe('selectMeasurePerDimension', () => {
    const query: ReportingQuery<TicketCubeWithJoins> =
        medianFirstAgentResponseTimePerAgentQueryFactory(
            {
                period: {
                    start_datetime: '2020-01-16T03:04:56.789-10:00',
                    end_datetime: '2020-01-02T03:04:56.789-10:00',
                },
            },
            'timezone',
        )

    const testScopeMeta = {
        scope: 'test-scope' as any,
        filters: ['periodStart', 'periodEnd'] as const,
        measures: ['medianFirstResponseTime'] as const,
        dimensions: ['agentId'] as const,
        timeDimensions: ['createdDatetime'] as const,
    } as const satisfies ScopeMeta

    const queryV2: BuiltQuery<typeof testScopeMeta> = {
        metricName: METRIC_NAMES.TEST_METRIC,
        scope: MetricScope.SatisfactionSurveys,
        measures: ['medianFirstResponseTime'],
        dimensions: ['agentId'],
    }

    const dimensionKey =
        TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId
    const measureKey =
        TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime

    it('should return empty object when data is null', () => {
        const result = selectMeasurePerDimension(
            null,
            query,
            undefined,
            false,
            '123',
        )

        expect(result).toEqual({
            value: null,
            decile: null,
            allData: [],
            allValues: [],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should return null values when dimensionId is not provided', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            undefined,
        )

        expect(result).toEqual({
            value: null,
            decile: null,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 456,
                    decile: 5,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should return null values when measure is not in query', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const queryWithoutMeasure: ReportingQuery<TicketCubeWithJoins> = {
            ...query,
            measures: [],
        }

        const result = selectMeasurePerDimension(
            data,
            queryWithoutMeasure,
            undefined,
            false,
            '123',
        )

        expect(result).toEqual({
            value: null,
            decile: null,
            allData: data,
            allValues: [],
            dimensions: queryWithoutMeasure.dimensions,
            measures: queryWithoutMeasure.measures,
        })
    })

    it('should return null values when dimension is not in query', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const queryWithoutDimension: ReportingQuery<TicketCubeWithJoins> = {
            ...query,
            dimensions: [],
        }

        const result = selectMeasurePerDimension(
            data,
            queryWithoutDimension,
            undefined,
            false,
            '123',
        )

        expect(result).toEqual({
            value: null,
            decile: null,
            allData: data,
            allValues: [],
            dimensions: queryWithoutDimension.dimensions,
            measures: queryWithoutDimension.measures,
        })
    })

    it('should return correct value and decile when dimensionId matches', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
            {
                [dimensionKey]: '456',
                [measureKey]: '789',
                decile: '7',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result).toEqual({
            value: 456,
            decile: 5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 456,
                    decile: 5,
                },
                {
                    dimension: '456',
                    value: 789,
                    decile: 7,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should parse numeric string values correctly', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '123.45',
                decile: '8.5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result).toEqual({
            value: 123.45,
            decile: 8.5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 123.45,
                    decile: 8.5,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should return null for non-numeric metric values', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: 'not-a-number',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result).toEqual({
            value: null,
            decile: 5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: null,
                    decile: 5,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should use queryV2 measures and dimensions when isV2 is true', () => {
        const data = [
            {
                agentId: '123',
                medianFirstResponseTime: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            queryV2,
            true,
            '123',
        )

        expect(result).toEqual({
            value: 456,
            decile: 5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 456,
                    decile: 5,
                },
            ],
            dimensions: queryV2.dimensions || query.dimensions,
            measures: queryV2.measures || query.measures,
        })
    })

    it('should use query measures and dimensions when isV2 is undefined', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            queryV2,
            undefined,
            '123',
        )

        expect(result).toEqual({
            value: 456,
            decile: 5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 456,
                    decile: 5,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should return null when queryV2 measures and dimensions are undefined', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            { ...queryV2, measures: undefined, dimensions: undefined },
            undefined,
            '123',
        )

        expect(result).toEqual({
            value: 456,
            decile: 5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 456,
                    decile: 5,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should use query measures and dimensions when queryV2 is undefined even if isV2 is true', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            true,
            '123',
        )

        expect(result).toEqual({
            value: 456,
            decile: 5,
            allData: data,
            allValues: [
                {
                    dimension: '123',
                    value: 456,
                    decile: 5,
                },
            ],
            dimensions: query.dimensions,
            measures: query.measures,
        })
    })

    it('should return allData with all input data', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
            {
                [dimensionKey]: '789',
                [measureKey]: '101',
                decile: '2',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result?.allData).toEqual(data)
        expect(result?.allData).toHaveLength(2)
    })

    it('should populate allValues array with all data rows when dimensionId is not provided', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
            {
                [dimensionKey]: '789',
                [measureKey]: '101',
                decile: '2',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            undefined,
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '123',
                value: 456,
                decile: 5,
            },
            {
                dimension: '789',
                value: 101,
                decile: 2,
            },
        ])
    })

    it('should populate allValues array with all data rows when dimensionId is provided', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
            {
                [dimensionKey]: '789',
                [measureKey]: '101',
                decile: '2',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '123',
                value: 456,
                decile: 5,
            },
            {
                dimension: '789',
                value: 101,
                decile: 2,
            },
        ])
    })

    it('should handle null or missing values in allValues array gracefully', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: null,
                decile: null,
            },
            {
                [dimensionKey]: null,
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '123',
                value: null,
                decile: null,
            },
            {
                dimension: '',
                value: 456,
                decile: 5,
            },
        ])
    })

    it('should return empty allValues array when data is null', () => {
        const result = selectMeasurePerDimension(
            null,
            query,
            undefined,
            false,
            '123',
        )

        expect(result?.allValues).toEqual([])
    })

    it('should return empty allValues array when data is undefined', () => {
        const result = selectMeasurePerDimension(
            undefined,
            query,
            undefined,
            false,
            '123',
        )

        expect(result?.allValues).toEqual([])
    })

    it('should handle numeric dimension values in allValues', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: '456',
                decile: '5',
            },
            {
                [dimensionKey]: '789',
                [measureKey]: '101',
                decile: '2',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            undefined,
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '123',
                value: 456,
                decile: 5,
            },
            {
                dimension: '789',
                value: 101,
                decile: 2,
            },
        ])
    })

    it('should use empty string for missing dimension values in allValues', () => {
        const data = [
            {
                [measureKey]: '456',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            undefined,
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '',
                value: 456,
                decile: 5,
            },
        ])
    })

    it('should use null for non-numeric measure values in allValues', () => {
        const data = [
            {
                [dimensionKey]: '123',
                [measureKey]: 'invalid',
                decile: '5',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            undefined,
            false,
            '123',
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '123',
                value: null,
                decile: 5,
            },
        ])
    })

    it('should populate allValues with V2 query dimensions when isV2 is true', () => {
        const data = [
            {
                agentId: '123',
                medianFirstResponseTime: '456',
                decile: '5',
            },
            {
                agentId: '789',
                medianFirstResponseTime: '101',
                decile: '2',
            },
        ]

        const result = selectMeasurePerDimension(
            data,
            query,
            queryV2,
            true,
            '123',
        )

        expect(result?.allValues).toEqual([
            {
                dimension: '123',
                value: 456,
                decile: 5,
            },
            {
                dimension: '789',
                value: 101,
                decile: 2,
            },
        ])
    })
})
