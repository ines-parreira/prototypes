import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks/dom'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {BREAKDOWN_FIELD, VALUE_FIELD} from 'hooks/reporting/withBreakdown'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {
    enrichWithPercentagesAndDeciles,
    useCustomFieldsTicketCountPerCustomFields,
} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {RootState, StoreDispatch} from 'state/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {
    getCustomFieldsOrder,
    getValueMode,
    ValueMode,
} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>()
jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries
)
jest.mock('state/ui/stats/agentPerformanceSlice')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
jest.mock('state/ui/stats/ticketInsightsSlice')
const getCustomFieldOrderMock = assumeMock(getCustomFieldsOrder)
const getValueModeMock = assumeMock(getValueMode)

describe('useCustomFieldsTicketCountPerCustomFields', () => {
    const selectedCustomFieldId = 123
    const customField = 'abc::xyz'
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const day2 = '2021-05-02T00:00:00+02:00'
    const day3 = '2021-05-03T00:00:00+02:00'
    const data: Record<string, TimeSeriesDataItem[][]> = {
        [customField]: [
            [
                {
                    dateTime: startDate,
                    value: 456,
                },
                {
                    dateTime: day2,
                    value: 123,
                },
                {
                    dateTime: day3,
                    value: 0,
                },
                {
                    dateTime: endDate,
                    value: 89,
                },
            ],
        ],
    }
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const defaultOrder = OrderDirection.Desc
    const isLoading = false

    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            data,
            isLoading,
        } as UseQueryResult<Record<string, TimeSeriesDataItem[][]>>)
        getCustomFieldOrderMock.mockReturnValue(defaultOrder)
        getValueModeMock.mockReturnValue(ValueMode.TotalCount)
    })

    it('should select value per dimension and dateTIme', () => {
        const {result} = renderHook(
            () =>
                useCustomFieldsTicketCountPerCustomFields(
                    selectedCustomFieldId
                ),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore({} as any)}>{children}</Provider>
                ),
            }
        )

        expect(result.current).toEqual({
            data: [
                {
                    [VALUE_FIELD]: 668,
                    [BREAKDOWN_FIELD]: 'abc',
                    decile: 9,
                    percentage: 100,
                    children: [
                        {
                            [VALUE_FIELD]: 668,
                            [BREAKDOWN_FIELD]: 'xyz',
                            children: [],
                            decile: 9,
                            percentage: 100,
                            timeSeries: [
                                {
                                    dateTime: startDate,
                                    decile: 9,
                                    percentage: 100,
                                    value: 456,
                                },
                                {
                                    dateTime: day2,
                                    decile: 9,
                                    percentage: 100,
                                    value: 123,
                                },
                                {
                                    dateTime: day3,
                                    decile: 0,
                                    percentage: 0,
                                    value: 0,
                                },
                                {
                                    dateTime: endDate,
                                    decile: 9,
                                    percentage: 100,
                                    value: 89,
                                },
                            ],
                        },
                    ],
                    timeSeries: [
                        {
                            dateTime: startDate,
                            decile: 9,
                            percentage: 100,
                            value: 456,
                        },
                        {
                            dateTime: day2,
                            decile: 9,
                            percentage: 100,
                            value: 123,
                        },
                        {
                            dateTime: day3,
                            decile: 0,
                            percentage: 0,
                            value: 0,
                        },
                        {
                            dateTime: endDate,
                            decile: 9,
                            percentage: 100,
                            value: 89,
                        },
                    ],
                },
            ],
            dateTimes: [
                '2021-05-01T00:00:00.000',
                '2021-05-02T00:00:00.000',
                '2021-05-03T00:00:00.000',
                '2021-05-04T00:00:00.000',
            ],
            isLoading: isLoading,
            order: defaultOrder,
        })
    })

    it('should return empty array when no data received', () => {
        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            data: undefined,
            isLoading,
        } as unknown as UseQueryResult<Record<string, TimeSeriesDataItem[][]>>)

        const {result} = renderHook(
            () =>
                useCustomFieldsTicketCountPerCustomFields(
                    selectedCustomFieldId
                ),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore({} as any)}>{children}</Provider>
                ),
            }
        )

        expect(result.current.data).toEqual([])
    })

    describe('enrichWithPercentagesAndDeciles', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const tag1DailyValues = [400, 123, 0, 75]
        const tag2DailyValues = [100, 0, 10, 25]
        const input = [
            {
                [VALUE_FIELD]: tag1DailyValues.reduce((sum, v) => sum + v),
                [BREAKDOWN_FIELD]: 'abc',
                children: [
                    {
                        [VALUE_FIELD]: tag1DailyValues.reduce(
                            (sum, v) => sum + v
                        ),
                        [BREAKDOWN_FIELD]: 'xyz',
                        children: [],
                        timeSeries: [
                            {
                                dateTime: startDate,
                                value: tag1DailyValues[0],
                            },
                            {
                                dateTime: day2,
                                value: tag1DailyValues[1],
                            },
                            {
                                dateTime: day3,
                                value: tag1DailyValues[2],
                            },
                            {
                                dateTime: endDate,
                                value: tag1DailyValues[3],
                            },
                        ],
                    },
                ],
                timeSeries: [
                    {
                        dateTime: startDate,
                        value: tag1DailyValues[0],
                    },
                    {
                        dateTime: day2,
                        value: tag1DailyValues[1],
                    },
                    {
                        dateTime: day3,
                        value: tag1DailyValues[2],
                    },
                    {
                        dateTime: endDate,
                        value: tag1DailyValues[3],
                    },
                ],
            },
            {
                [VALUE_FIELD]: tag2DailyValues.reduce((sum, v) => sum + v),
                [BREAKDOWN_FIELD]: 'asd',
                children: [
                    {
                        [VALUE_FIELD]: tag2DailyValues.reduce(
                            (sum, v) => sum + v
                        ),
                        [BREAKDOWN_FIELD]: 'qwe',
                        children: [],
                        timeSeries: [
                            {
                                dateTime: startDate,
                                value: tag1DailyValues[0],
                            },
                            {
                                dateTime: day2,
                                value: tag1DailyValues[1],
                            },
                            {
                                dateTime: day3,
                                value: tag1DailyValues[2],
                            },
                            {
                                dateTime: endDate,
                                value: tag1DailyValues[3],
                            },
                        ],
                    },
                ],
                timeSeries: [
                    {
                        dateTime: startDate,
                        value: tag2DailyValues[0],
                    },
                    {
                        dateTime: day2,
                        value: tag2DailyValues[1],
                    },
                    {
                        dateTime: day3,
                        value: tag2DailyValues[2],
                    },
                    {
                        dateTime: endDate,
                        value: tag2DailyValues[3],
                    },
                ],
            },
        ]

        it('should replace values with percentages', () => {
            const result = enrichWithPercentagesAndDeciles(input)

            expect(result).toEqual([
                {
                    [VALUE_FIELD]: tag1DailyValues.reduce((sum, v) => sum + v),
                    [BREAKDOWN_FIELD]: 'abc',
                    children: [
                        {
                            [VALUE_FIELD]: tag1DailyValues.reduce(
                                (sum, v) => sum + v
                            ),
                            [BREAKDOWN_FIELD]: 'xyz',
                            children: [],
                            decile: 9,
                            percentage: 100,
                            timeSeries: [
                                {
                                    dateTime: startDate,
                                    decile: 9,
                                    percentage: 100,
                                    value: tag1DailyValues[0],
                                },
                                {
                                    dateTime: day2,
                                    decile: 9,
                                    percentage: 100,
                                    value: tag1DailyValues[1],
                                },
                                {
                                    dateTime: day3,
                                    decile: 0,
                                    percentage: 0,
                                    value: tag1DailyValues[2],
                                },
                                {
                                    dateTime: endDate,
                                    decile: 9,
                                    percentage: 100,
                                    value: tag1DailyValues[3],
                                },
                            ],
                        },
                    ],
                    decile: 8,
                    percentage: 81.58253751705321,
                    timeSeries: [
                        {
                            dateTime: startDate,
                            decile: 8,
                            percentage: 80,
                            value: tag1DailyValues[0],
                        },
                        {
                            dateTime: day2,
                            decile: 9,
                            percentage: 100,
                            value: tag1DailyValues[1],
                        },
                        {
                            dateTime: day3,
                            decile: 0,
                            percentage: 0,
                            value: tag1DailyValues[2],
                        },
                        {
                            dateTime: endDate,
                            decile: 8,
                            percentage: 75,
                            value: tag1DailyValues[3],
                        },
                    ],
                },
                {
                    [VALUE_FIELD]: tag2DailyValues.reduce((sum, v) => sum + v),
                    [BREAKDOWN_FIELD]: 'asd',
                    children: [
                        {
                            [VALUE_FIELD]: tag2DailyValues.reduce(
                                (sum, v) => sum + v
                            ),
                            [BREAKDOWN_FIELD]: 'qwe',
                            children: [],
                            decile: 9,
                            percentage: 100,
                            timeSeries: [
                                {
                                    dateTime: startDate,
                                    decile: 9,
                                    percentage: 100,
                                    value: tag1DailyValues[0],
                                },
                                {
                                    dateTime: day2,
                                    decile: 9,
                                    percentage: 100,
                                    value: tag1DailyValues[1],
                                },
                                {
                                    dateTime: day3,
                                    decile: 0,
                                    percentage: 0,
                                    value: tag1DailyValues[2],
                                },
                                {
                                    dateTime: endDate,
                                    decile: 9,
                                    percentage: 100,
                                    value: tag1DailyValues[3],
                                },
                            ],
                        },
                    ],
                    decile: 2,
                    percentage: 18.417462482946796,
                    timeSeries: [
                        {
                            dateTime: startDate,
                            decile: 2,
                            percentage: 20,
                            value: tag2DailyValues[0],
                        },
                        {
                            dateTime: day2,
                            decile: 0,
                            percentage: 0,
                            value: tag2DailyValues[1],
                        },
                        {
                            dateTime: day3,
                            decile: 9,
                            percentage: 100,
                            value: tag2DailyValues[2],
                        },
                        {
                            dateTime: endDate,
                            decile: 3,
                            percentage: 25,
                            value: tag2DailyValues[3],
                        },
                    ],
                },
            ])
        })
    })
})
