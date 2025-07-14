import { UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { defaultEnrichmentFields } from 'domains/reporting/hooks/useDrillDownData'
import {
    fetchMetricPerDimension,
    fetchMetricPerDimensionWithEnrichment,
    QueryReturnType,
    useMetricPerDimension,
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
    useEnrichedPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { medianFirstResponseTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import {
    CustomFieldsReportingQuery,
    customFieldsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { postEnrichedReporting } from 'domains/reporting/models/resources'
import {
    EnrichmentFields,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)
jest.mock('domains/reporting/models/resources')
const useEnrichedPostReportingMock = assumeMock(useEnrichedPostReporting)
const postEnrichedReportingMock = assumeMock(postEnrichedReporting)

jest.mock('domains/reporting/hooks/withEnrichment')
const withEnrichmentMock = assumeMock(withEnrichment)

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
        it('should usePostReporting with query and select', () => {
            usePostReportingMock.mockReturnValue(mockedResponse)

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
            usePostReportingMock.mockReturnValue(mockedResponse)

            const { result } = renderHook(() =>
                useMetricPerDimension(query, agentId),
            )

            expect(result.current?.data?.value).toBeNull()
        })

        it('should return null when called without entity', () => {
            usePostReportingMock.mockReturnValue(mockedResponse)

            const { result } = renderHook(() => useMetricPerDimension(query))

            expect(result.current?.data?.value).toBeNull()
        })

        it('should return null when no data in response', () => {
            const agentIdNotInResponse = 'notInResponse'
            usePostReportingMock.mockReturnValue({
                ...mockedResponse,
                data: undefined,
            })

            const { result } = renderHook(() =>
                useMetricPerDimension(query, agentIdNotInResponse),
            )

            expect(result.current?.data).toBeNull()
        })

        it('should use the select function', () => {
            const mockedClientResponse = {
                data: {
                    data: mockedResponse.data,
                },
            } as any
            usePostReportingMock.mockImplementation(
                jest
                    .fn()
                    .mockImplementation(
                        (
                            query,
                            { select }: { select: (data: unknown) => unknown },
                        ) => ({
                            ...mockedResponse,
                            data: select(mockedClientResponse),
                        }),
                    ),
            )

            const { result } = renderHook(() =>
                useMetricPerDimension(query, String(agentId)),
            )

            expect(result.current?.data?.allData).toEqual(mockedResponse.data)
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

    it('should usePostReporting with query and select', () => {
        usePostReportingMock.mockReturnValue(
            withBreakdown(
                { data: mockedResponse } as any,
                BREAKDOWN_FIELD,
                VALUE_FIELD,
            ).data as any,
        )

        const { result } = renderHook(() =>
            useMetricPerDimensionWithBreakdown(query),
        )

        expect(result.current).toEqual({
            isFetching: mockedResponse.isFetching,
            isError: mockedResponse.isError,
            data: {
                allData: [
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
            },
        })
    })
})

describe('useMetricPerDimensionWithEnrichment', () => {
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
        useEnrichedPostReportingMock.mockReturnValue(mockedResponse as any)
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
