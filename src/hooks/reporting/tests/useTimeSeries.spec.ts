import {renderHook} from '@testing-library/react-hooks'
import {AxiosResponse} from 'axios'

import {usePostReporting} from 'models/reporting/queries'
import {
    ReportingResponse,
    ReportingGranularity,
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'
import useTimeSeries, {TimeSeriesQuery} from '../useTimeSeries'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useTimeSeries', () => {
    const defaultTimeDimension = {
        dimension: TicketDimension.CreatedDatetime,
        granularity: ReportingGranularity.Hour,
        dateRange: ['2022-01-02T00:00:00.000', '2022-01-02T05:00:00.000'],
    }
    const defaultQuery: TimeSeriesQuery = {
        measures: [TicketMeasure.FirstResponseTime, TicketMeasure.SurveyScore],
        dimensions: [],
        filters: [],
        timeDimensions: [defaultTimeDimension],
    }
    const defaultData = [
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketMeasure.FirstResponseTime]: '65',
            [TicketMeasure.SurveyScore]: '3.4',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
            [TicketMeasure.FirstResponseTime]: '32',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
            [TicketMeasure.SurveyScore]: '4.1',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
            [TicketMeasure.FirstResponseTime]: '139',
            [TicketMeasure.SurveyScore]: '1.2',
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

    beforeEach(() => {
        jest.resetAllMocks()
    })

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
                measures: [TicketMeasure.FirstResponseTime],
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
                            [TicketMeasure.FirstResponseTime]: 3,
                        },
                    ],
                },
            } as unknown as AxiosResponse<ReportingResponse<typeof defaultData>>)
        ).toEqual([
            [
                {
                    dateTime: '2023-04-17T00:00:00.000',
                    label: TicketMeasure.FirstResponseTime,
                    value: 3,
                },
            ],
        ])
    })
})
