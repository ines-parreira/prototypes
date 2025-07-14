import { AxiosResponse } from 'axios'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
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
} from 'domains/reporting/models/queries'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingResponse,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
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
            },
            {
                dateTime: '2022-01-02T01:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 32,
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
                value: 139,
            },
        ],
        [
            {
                dateTime: '2022-01-02T00:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 3.4,
            },
            {
                dateTime: '2022-01-02T01:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 0,
            },
            {
                dateTime: '2022-01-02T02:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 4.1,
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
            },
        ],
    ]

    it('should call usePostReportingMock with the query', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingMock.mock.calls[0][1]?.select

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [defaultQuery],
            expect.objectContaining({
                select,
            }),
        )
    })

    it('should fill in the missing dates', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingMock.mock.calls[0][1]?.select

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
        const select = usePostReportingMock.mock.calls[0][1]?.select

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
                        },
                    ],
                ],
            })
        })
    })
})
