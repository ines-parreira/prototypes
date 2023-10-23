import {renderHook} from '@testing-library/react-hooks'
import {AxiosResponse} from 'axios'
import {
    BREAKDOWN_FIELD,
    TAG_SEPARATOR,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'

import {usePostReporting} from 'models/reporting/queries'
import {
    ReportingResponse,
    ReportingGranularity,
    ReportingFilterOperator,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'
import useTimeSeries, {useTimeSeriesPerDimension} from '../useTimeSeries'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useTimeSeries', () => {
    const defaultTimeDimension = {
        dimension: TicketDimension.CreatedDatetime,
        granularity: ReportingGranularity.Hour,
        dateRange: ['2022-01-02T00:00:00.000', '2022-01-02T05:00:00.000'],
    }
    const defaultQuery: TimeSeriesQuery<TicketCubeWithJoins> = {
        measures: [
            TicketMessagesMeasure.FirstResponseTime,
            TicketSatisfactionSurveyMeasure.SurveyScore,
        ],
        dimensions: [],
        filters: [],
        timeDimensions: [defaultTimeDimension],
    }
    const defaultData = [
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketMessagesMeasure.FirstResponseTime]: '65',
            [TicketSatisfactionSurveyMeasure.SurveyScore]: '3.4',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
            [TicketMessagesMeasure.FirstResponseTime]: '32',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
            [TicketSatisfactionSurveyMeasure.SurveyScore]: '4.1',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
            [TicketMessagesMeasure.FirstResponseTime]: '139',
            [TicketSatisfactionSurveyMeasure.SurveyScore]: '1.2',
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

    it('should call usePostReportingMock with the query', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingMock.mock.calls[0][1]?.select

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [defaultQuery],
            expect.objectContaining({
                select,
            })
        )
    })

    it('should fill in the missing dates', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingMock.mock.calls[0][1]?.select

        expect(
            select?.({
                data: defaultResult,
            } as unknown as AxiosResponse<ReportingResponse<typeof defaultData>>)
        ).toMatchSnapshot()
    })

    it('should make Monday the beginning of the week', () => {
        renderHook(() =>
            useTimeSeries({
                ...defaultQuery,
                measures: [TicketMessagesMeasure.FirstResponseTime],
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
            })
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
                            [TicketMessagesMeasure.FirstResponseTime]: 3,
                        },
                    ],
                },
            } as unknown as AxiosResponse<ReportingResponse<typeof defaultData>>)
        ).toEqual([
            [
                {
                    dateTime: '2023-04-17T00:00:00.000',
                    label: TicketMessagesMeasure.FirstResponseTime,
                    value: 3,
                },
            ],
        ])
    })
})

describe('useTimeSeriesPerDimension', () => {
    const customFieldId = '1'
    const ticketField = 'customTag'
    const ticketFieldL2_1 = 'subTag'
    const ticketFieldL2_2 = 'subTag2'
    const defaultTimeDimension = {
        dimension:
            TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
        granularity: ReportingGranularity.Hour,
        dateRange: ['2022-01-02T00:00:00.000', '2022-01-02T05:00:00.000'],
    }
    const defaultQuery: TimeSeriesQuery<HelpdeskMessageCubeWithJoins> = {
        measures: [VALUE_FIELD],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
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

    it('should return separate time series per dimension value', () => {
        renderHook(() =>
            useTimeSeriesPerDimension({
                ...defaultQuery,
            })
        )
        const select = usePostReportingMock.mock.calls[0][1]?.select

        expect(
            select?.({
                data: defaultResult,
            } as unknown as AxiosResponse<ReportingResponse<typeof defaultData>>)
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
