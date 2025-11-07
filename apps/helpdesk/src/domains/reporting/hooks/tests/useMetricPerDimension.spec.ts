import { assumeMock, renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defaultEnrichmentFields } from 'domains/reporting/hooks/useDrillDownData'
import {
    fetchMetricPerDimension,
    fetchMetricPerDimensionV2,
    fetchMetricPerDimensionWithEnrichment,
    QueryReturnType,
    useMetricPerDimension,
    useMetricPerDimensionV2,
    useMetricPerDimensionWithBreakdown,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    BREAKDOWN_FIELD,
    TAG_SEPARATOR,
    VALUE_FIELD,
    withBreakdown,
} from 'domains/reporting/hooks/withBreakdown'
import { withEnrichment } from 'domains/reporting/hooks/withEnrichment'
import { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesCube,
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    fetchPostReporting,
    fetchPostReportingV2,
    useEnrichedPostReporting,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { medianFirstResponseTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import {
    CustomFieldsReportingQuery,
    customFieldsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    postEnrichedReporting,
    postReportingV1,
} from 'domains/reporting/models/resources'
import {
    EnrichmentFields,
    ReportingQuery,
} from 'domains/reporting/models/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const usePostReportingMockV2 = assumeMock(usePostReportingV2)
const fetchPostReportingMock = assumeMock(fetchPostReporting)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)
jest.mock('domains/reporting/models/resources')
const useEnrichedPostReportingMock = assumeMock(useEnrichedPostReporting)
const postEnrichedReportingMock = assumeMock(postEnrichedReporting)
const postReportingV1Mock = assumeMock(postReportingV1)

jest.mock('domains/reporting/hooks/withBreakdown')
const withBreakdownMock = assumeMock(withBreakdown)

jest.mock('domains/reporting/hooks/withEnrichment')
const withEnrichmentMock = assumeMock(withEnrichment)

jest.mock('domains/reporting/utils/metricExecutionHandler')

describe('MetricPerDimension', () => {
    const query: ReportingQuery<TicketCubeWithJoins> =
        medianFirstResponseTimeMetricPerAgentQueryFactory(
            {
                period: {
                    start_datetime: '2020-01-16T03:04:56.789-10:00',
                    end_datetime: '2020-01-02T03:04:56.789-10:00',
                },
            },
            'timezone',
        )
    const queryV2 = {
        metricName: METRIC_NAMES.TEST_METRIC,
        scope: MetricScope.SatisfactionSurveys,
    }

    const agentId = 456
    const metricValue = 4567

    const data = Array.from(Array(150).keys()).map((index) => ({
        [TicketMessagesDimension.FirstHelpdeskMessageUserId]: String(
            agentId + index,
        ),
        [TicketMessagesMeasure.MedianFirstResponseTime]: String(
            metricValue + index,
        ),
    }))

    const mockedResponse: UseQueryResult<QueryReturnType<TicketMessagesCube>> =
        {
            isFetching: false,
            isError: false,
            data: data,
        } as unknown as UseQueryResult<QueryReturnType<TicketMessagesCube>>

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
                    decile: null,
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

            expect(result.current?.data).toBeNull()
        })

        it('should use the select function', () => {
            mockUsePostReporting(mockedResponse)

            const { result } = renderHook(() =>
                useMetricPerDimension(query, String(agentId)),
            )

            expect(result.current?.data?.allData).toEqual(mockedResponse.data)
        })
    })

    describe('useMetricPerDimensionV2', () => {
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
            QueryReturnType<TicketMessagesCube>
        > = {
            isFetching: false,
            isError: false,
            data: dataWithDeciles,
        } as unknown as UseQueryResult<QueryReturnType<TicketMessagesCube>>

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should return metric data with value and decile when dimensionId is provided', () => {
            const mockResponse = {
                ...mockedResponseWithDeciles,
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

            expect(result.current).toEqual({
                isFetching: mockedResponseWithDeciles.isFetching,
                isError: mockedResponseWithDeciles.isError,
                data: {
                    value: metricValue,
                    decile: decileValue,
                    allData: mockedResponseWithDeciles.data,
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
                    decile: null,
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

describe('useMetricPerDimensionWithBreakdown', () => {
    const customFieldId = 1
    const ticketField = 'customTag'
    const ticketFieldL2_1 = 'subTag'
    const ticketFieldL2_2 = 'subTag2'
    const query: CustomFieldsReportingQuery =
        customFieldsTicketCountQueryFactory(
            {
                period: {
                    start_datetime: '2020-01-16T03:04:56.789-10:00',
                    end_datetime: '2020-01-02T03:04:56.789-10:00',
                },
            },
            'timezone',
            customFieldId,
        )
    const metricValue = 5
    const data = [
        {
            [BREAKDOWN_FIELD]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
            [VALUE_FIELD]: String(metricValue),
        },
        {
            [BREAKDOWN_FIELD]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
            [VALUE_FIELD]: String(metricValue),
        },
    ]

    const mockedResponse = {
        isFetching: false,
        isError: false,
        data: data,
    }

    it('should usePostReporting with query and select', async () => {
        const rawApiResponse = {
            data: { data: data },
        }
        const processedData = {
            data: [
                {
                    [BREAKDOWN_FIELD]: ticketField,
                    [VALUE_FIELD]: String(10),
                    children: [
                        {
                            ...data[0],
                            [BREAKDOWN_FIELD]: ticketFieldL2_1,
                            children: [],
                        },
                        {
                            ...data[1],
                            [BREAKDOWN_FIELD]: ticketFieldL2_2,
                            children: [],
                        },
                    ],
                },
            ],
        }

        postReportingV1Mock.mockResolvedValue(rawApiResponse as any)
        withBreakdownMock.mockReturnValue(processedData as any)

        let capturedQueryFn: (() => Promise<any>) | undefined
        usePostReportingMock.mockImplementation(
            jest.fn().mockImplementation((query, options) => {
                capturedQueryFn = options.queryFn
                return {
                    isFetching: false,
                    isError: false,
                    data: processedData.data,
                }
            }),
        )

        const { result } = renderHook(() =>
            useMetricPerDimensionWithBreakdown(query),
        )

        if (capturedQueryFn) {
            await capturedQueryFn()
        }

        await waitFor(() => {
            expect(postReportingV1Mock).toHaveBeenCalledWith([query])
            expect(withBreakdownMock).toHaveBeenCalledWith(
                rawApiResponse,
                query['dimensions'][0],
                query['measures'][0],
            )
            expect(result.current).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    allData: processedData.data,
                },
            })
        })
    })
})

describe('useMetricPerDimensionWithEnrichment', () => {
    function mockUseEnrichedPostReporting(response: any) {
        const mockedClientResponse = {
            data: {
                data: response.data,
            },
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
                    decile: null,
                    value: null,
                    allData: mockedResponse.data,
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
