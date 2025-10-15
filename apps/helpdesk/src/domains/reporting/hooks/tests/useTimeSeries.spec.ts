import { assumeMock, renderHook } from '@repo/testing'
import { AxiosResponse } from 'axios'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    BREAKDOWN_FIELD,
    TAG_SEPARATOR,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    fetchPostReporting,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingResponse,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const usePostReportingV2Mock = assumeMock(usePostReportingV2)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

describe('useTimeSeries', () => {
    const defaultTimeDimension = {
        dimension: TicketDimension.CreatedDatetime,
        granularity: ReportingGranularity.Hour,
        dateRange: ['2022-01-02T00:00:00.000', '2022-01-02T05:00:00.000'],
    }
    const defaultQuery: TimeSeriesQuery<TicketCubeWithJoins> = {
        measures: [
            TicketMessagesMeasure.MedianFirstResponseTime,
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        ],
        dimensions: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
        timeDimensions: [defaultTimeDimension],
    }
    const defaultData = [
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
        },
    ]
    const defaultResult = {
        annotation: {
            title: 'foo title',
            shortTitle: 'foo',
            type: 'array',
        },
        data: defaultData,
        query: defaultQuery,
    }

    const expectedTimeSeriesResult = [
        [
            {
                dateTime: '2022-01-02T00:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 65,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
                },
            },
            {
                dateTime: '2022-01-02T01:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 32,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
                },
            },
            {
                dateTime: '2022-01-02T02:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 0,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
                },
            },
            {
                dateTime: '2022-01-02T03:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 0,
            },
            {
                dateTime: '2022-01-02T04:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 139,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
                },
            },
        ],
        [
            {
                dateTime: '2022-01-02T00:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 3.4,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
                },
            },
            {
                dateTime: '2022-01-02T01:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 0,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
                },
            },
            {
                dateTime: '2022-01-02T02:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 4.1,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
                },
            },
            {
                dateTime: '2022-01-02T03:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 0,
            },
            {
                dateTime: '2022-01-02T04:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 1.2,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
                },
            },
        ],
    ]

    it('should call usePostReportingV2Mock with the query', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingV2Mock.mock.calls[0][2]?.select

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            undefined,
            expect.objectContaining({
                select,
            }),
        )
    })

    it('should fill in the missing dates', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingV2Mock.mock.calls[0][2]?.select

        expect(
            select?.({
                data: defaultResult,
            } as unknown as AxiosResponse<
                ReportingResponse<typeof defaultData>
            >),
        ).toEqual(expectedTimeSeriesResult)
    })

    it('should make Monday the beginning of the week', () => {
        renderHook(() =>
            useTimeSeries({
                ...defaultQuery,
                measures: [TicketMessagesMeasure.MedianFirstResponseTime],
                timeDimensions: [
                    {
                        ...defaultTimeDimension,
                        granularity: ReportingGranularity.Week,
                        dateRange: [
                            '2023-04-18T00:00:00.000',
                            '2023-04-20T00:00:00.000',
                        ],
                    },
                ],
            }),
        )
        const select = usePostReportingV2Mock.mock.calls[0][2]?.select

        expect(
            select?.({
                data: {
                    ...defaultResult,
                    data: [
                        {
                            [TicketDimension.CreatedDatetime]:
                                '2023-04-17T00:00:00.000',
                            [TicketMessagesMeasure.MedianFirstResponseTime]: 3,
                        },
                    ],
                },
            } as unknown as AxiosResponse<
                ReportingResponse<typeof defaultData>
            >),
        ).toEqual([
            [
                {
                    dateTime: '2023-04-17T00:00:00.000',
                    label: TicketMessagesMeasure.MedianFirstResponseTime,
                    value: 3,
                    rawData: {
                        [TicketDimension.CreatedDatetime]:
                            '2023-04-17T00:00:00.000',
                        [TicketMessagesMeasure.MedianFirstResponseTime]: 3,
                    },
                },
            ],
        ])
    })

    describe('fetchTimeSeries', () => {
        beforeEach(() => {
            fetchPostReportingMock.mockResolvedValue({
                data: { data: defaultData },
            } as any)
        })
        it('should use fetchPostReporting and return formatted data', async () => {
            const result = await fetchTimeSeries(defaultQuery)

            expect(result).toEqual(expectedTimeSeriesResult)
        })
    })

    describe('edge cases for select function', () => {
        it('should handle empty data array', () => {
            renderHook(() => useTimeSeries(defaultQuery))
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            const result = select?.({
                data: {
                    ...defaultResult,
                    data: [],
                },
            } as unknown as AxiosResponse<ReportingResponse<never[]>>)

            expect(result).toEqual([
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                ],
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                ],
            ])
        })

        it('should handle single data point with all measures populated', () => {
            renderHook(() => useTimeSeries(defaultQuery))
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            const singleDataPoint = [
                {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '42',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.5',
                    extraField: 'extraValue',
                },
            ]

            const result = select?.({
                data: {
                    ...defaultResult,
                    data: singleDataPoint,
                },
            } as unknown as AxiosResponse<
                ReportingResponse<typeof singleDataPoint>
            >)

            expect(result).toEqual([
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 42,
                        rawData: {
                            [TicketDimension.CreatedDatetime]:
                                '2022-01-02T01:00:00',
                            [TicketMessagesMeasure.MedianFirstResponseTime]:
                                '42',
                            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]:
                                '4.5',
                            extraField: 'extraValue',
                        },
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                ],
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 4.5,
                        rawData: {
                            [TicketDimension.CreatedDatetime]:
                                '2022-01-02T01:00:00',
                            [TicketMessagesMeasure.MedianFirstResponseTime]:
                                '42',
                            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]:
                                '4.5',
                            extraField: 'extraValue',
                        },
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                ],
            ])
        })

        it('should handle data with null and undefined measure values', () => {
            renderHook(() => useTimeSeries(defaultQuery))
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            const dataWithNulls = [
                {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: null,
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: undefined,
                },
                {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '0',
                },
            ]

            const result = select?.({
                data: {
                    ...defaultResult,
                    data: dataWithNulls,
                },
            } as unknown as AxiosResponse<
                ReportingResponse<typeof dataWithNulls>
            >)

            // Test that rawData is preserved for both data points
            expect(result).toBeDefined()
            expect(Array.isArray(result)).toBe(true)
            if (result && Array.isArray(result) && result.length > 0) {
                expect(result[0][1]?.rawData).toEqual({
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: null,
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: undefined,
                })
                expect(result[0][2]?.rawData).toEqual({
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '0',
                })
            }
        })
    })

    it('should call usePostReportingV2 with V2 queries when provided', () => {
        const queryV2 = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        renderHook(() => useTimeSeries(defaultQuery, queryV2))

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            queryV2,
            expect.objectContaining({
                select: expect.any(Function),
            }),
        )
    })

    it('should return data when using V2 queries', () => {
        const queryV2 = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        const singleDataPoint = [
            {
                [TicketDimension.CreatedDatetime]: '2023-04-17T00:00:00.000',
                [TicketMessagesMeasure.MedianFirstResponseTime]: 3,
            },
        ]

        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultResult,
            data: singleDataPoint,
        } as any)

        const { result } = renderHook(() =>
            useTimeSeries(defaultQuery, queryV2),
        )

        expect(result.current.data).toEqual(singleDataPoint)
    })
})

describe('TimeSeriesPerDimension', () => {
    const customFieldId = '1'
    const ticketField = 'customTag'
    const ticketFieldL2_1 = 'subTag'
    const ticketFieldL2_2 = 'subTag2'
    const unEscapedField = '\"anotherCustomTag::subTag\"'
    const defaultTimeDimension = {
        dimension:
            TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
        granularity: ReportingGranularity.Hour,
        dateRange: ['2022-01-02T00:00:00.000', '2022-01-02T05:00:00.000'],
    }
    const defaultQuery: TimeSeriesQuery<HelpdeskMessageCubeWithJoins> = {
        measures: [VALUE_FIELD],
        dimensions: [BREAKDOWN_FIELD],
        filters: [
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [customFieldId],
            },
        ],
        metricName: METRIC_NAMES.TEST_METRIC,
        timeDimensions: [defaultTimeDimension],
    }
    const defaultData = [
        {
            [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                '2022-01-02T00:00:00',
            [VALUE_FIELD]: '65',
            [BREAKDOWN_FIELD]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
        },
        {
            [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                '2022-01-02T04:00:00',
            [VALUE_FIELD]: '139',
            [BREAKDOWN_FIELD]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
        },
        {
            [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                '2022-01-02T04:00:00',
            [VALUE_FIELD]: '55',
            [BREAKDOWN_FIELD]: unEscapedField,
        },
    ]
    const defaultResult = {
        annotation: {
            title: 'foo title',
            shortTitle: 'foo',
            type: 'array',
        },
        data: defaultData,
        query: defaultQuery,
    }

    describe('useTimeSeriesPerDimension', () => {
        it('should return separate time series per escaped dimension value', () => {
            renderHook(() =>
                useTimeSeriesPerDimension({
                    ...defaultQuery,
                }),
            )
            const select = usePostReportingMock.mock.calls[0][1]?.select

            expect(
                select?.({
                    data: defaultResult,
                } as unknown as AxiosResponse<
                    ReportingResponse<typeof defaultData>
                >),
            ).toEqual({
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 65,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T00:00:00',
                                [VALUE_FIELD]: '65',
                            },
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                    ],
                ],
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 139,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '139',
                            },
                        },
                    ],
                ],
                [`${stripEscapedQuotes(unEscapedField)}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 55,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${stripEscapedQuotes(unEscapedField)}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '55',
                            },
                        },
                    ],
                ],
            })
        })

        it('should return separate time series per dimension value', () => {
            const query: TimeSeriesQuery<HelpdeskMessageCubeWithJoins> = {
                measures: [VALUE_FIELD],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                filters: [
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                ],
                metricName: METRIC_NAMES.TEST_METRIC,
                timeDimensions: [defaultTimeDimension],
            }
            const data = [
                {
                    [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                        '2022-01-02T00:00:00',
                    [VALUE_FIELD]: '65',
                    [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                },
                {
                    [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                        '2022-01-02T04:00:00',
                    [VALUE_FIELD]: '139',
                    [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                },
            ]
            const result = {
                annotation: {
                    title: 'foo title',
                    shortTitle: 'foo',
                    type: 'array',
                },
                data: data,
                query: query,
            }

            renderHook(() =>
                useTimeSeriesPerDimension({
                    ...query,
                }),
            )
            const select = usePostReportingMock.mock.calls[0][1]?.select

            expect(
                select?.({
                    data: result,
                } as unknown as AxiosResponse<ReportingResponse<typeof data>>),
            ).toEqual({
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 65,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T00:00:00',
                                [VALUE_FIELD]: '65',
                            },
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                    ],
                ],
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 139,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '139',
                            },
                        },
                    ],
                ],
            })
        })
    })

    describe('fetchTimeSeriesPerDimension', () => {
        it('should return separate time series per dimension value', async () => {
            fetchPostReportingMock.mockResolvedValue({
                data: defaultResult,
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchTimeSeriesPerDimension({
                ...defaultQuery,
            })

            expect(result).toEqual({
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 65,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T00:00:00',
                                [VALUE_FIELD]: '65',
                            },
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                    ],
                ],
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 139,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '139',
                            },
                        },
                    ],
                ],
                [`${stripEscapedQuotes(unEscapedField)}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 55,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${stripEscapedQuotes(unEscapedField)}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '55',
                            },
                        },
                    ],
                ],
            })
        })
    })
})
