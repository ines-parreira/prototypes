import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks/dom'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {
    replaceValuesWithPercentages,
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
    const dateTime = '2021-05-02T00:00:00+02:00'
    const data: Record<string, TimeSeriesDataItem[][]> = {
        [customField]: [
            [
                {
                    dateTime: startDate,
                    value: 456,
                },
                {
                    dateTime: dateTime,
                    value: 123,
                },
                {
                    dateTime: '2021-05-03T00:00:00+02:00',
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
                    'TicketCustomFields.ticketCount': 668,
                    'TicketCustomFields.valueString': 'abc',
                    children: [
                        {
                            'TicketCustomFields.ticketCount': 668,
                            'TicketCustomFields.valueString': 'xyz',
                            children: [],
                            timeSeries: [
                                {
                                    dateTime: '2021-05-01T00:00:00+02:00',
                                    value: 456,
                                },
                                {
                                    dateTime: '2021-05-02T00:00:00+02:00',
                                    value: 123,
                                },
                                {
                                    dateTime: '2021-05-03T00:00:00+02:00',
                                    value: 0,
                                },
                                {
                                    dateTime: '2021-05-04T23:59:59+02:00',
                                    value: 89,
                                },
                            ],
                        },
                    ],
                    timeSeries: [
                        {
                            dateTime: '2021-05-01T00:00:00+02:00',
                            value: 456,
                        },
                        {
                            dateTime: '2021-05-02T00:00:00+02:00',
                            value: 123,
                        },
                        {
                            dateTime: '2021-05-03T00:00:00+02:00',
                            value: 0,
                        },
                        {
                            dateTime: '2021-05-04T23:59:59+02:00',
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

    describe('replaceValuesWithPercentages', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const input = [
            {
                'TicketCustomFields.ticketCount': 668,
                'TicketCustomFields.valueString': 'abc',
                children: [
                    {
                        'TicketCustomFields.ticketCount': 668,
                        'TicketCustomFields.valueString': 'xyz',
                        children: [],
                        timeSeries: [
                            {
                                dateTime: '2021-05-01T00:00:00+02:00',
                                value: 456,
                            },
                            {
                                dateTime: '2021-05-02T00:00:00+02:00',
                                value: 123,
                            },
                            {
                                dateTime: '2021-05-03T00:00:00+02:00',
                                value: 0,
                            },
                            {
                                dateTime: '2021-05-04T23:59:59+02:00',
                                value: 89,
                            },
                        ],
                    },
                ],
                timeSeries: [
                    {
                        dateTime: '2021-05-01T00:00:00+02:00',
                        value: 456,
                    },
                    {
                        dateTime: '2021-05-02T00:00:00+02:00',
                        value: 123,
                    },
                    {
                        dateTime: '2021-05-03T00:00:00+02:00',
                        value: 0,
                    },
                    {
                        dateTime: '2021-05-04T23:59:59+02:00',
                        value: 89,
                    },
                ],
            },
            {
                'TicketCustomFields.ticketCount': 668,
                'TicketCustomFields.valueString': 'asd',
                children: [
                    {
                        'TicketCustomFields.ticketCount': 668,
                        'TicketCustomFields.valueString': 'qwe',
                        children: [],
                        timeSeries: [
                            {
                                dateTime: '2021-05-01T00:00:00+02:00',
                                value: 456,
                            },
                            {
                                dateTime: '2021-05-02T00:00:00+02:00',
                                value: 123,
                            },
                            {
                                dateTime: '2021-05-03T00:00:00+02:00',
                                value: 0,
                            },
                            {
                                dateTime: '2021-05-04T23:59:59+02:00',
                                value: 89,
                            },
                        ],
                    },
                ],
                timeSeries: [
                    {
                        dateTime: '2021-05-01T00:00:00+02:00',
                        value: 456,
                    },
                    {
                        dateTime: '2021-05-02T00:00:00+02:00',
                        value: 123,
                    },
                    {
                        dateTime: '2021-05-03T00:00:00+02:00',
                        value: 0,
                    },
                    {
                        dateTime: '2021-05-04T23:59:59+02:00',
                        value: 89,
                    },
                ],
            },
        ]

        it('should replace values with percentages', () => {
            const result = replaceValuesWithPercentages(input)

            expect(result).toEqual([
                {
                    'TicketCustomFields.ticketCount': 50,
                    'TicketCustomFields.valueString': 'abc',
                    children: [
                        {
                            'TicketCustomFields.ticketCount': 100,
                            'TicketCustomFields.valueString': 'xyz',
                            children: [],
                            timeSeries: [
                                {
                                    dateTime: '2021-05-01T00:00:00+02:00',
                                    value: 100,
                                },
                                {
                                    dateTime: '2021-05-02T00:00:00+02:00',
                                    value: 100,
                                },
                                {
                                    dateTime: '2021-05-03T00:00:00+02:00',
                                    value: 0,
                                },
                                {
                                    dateTime: '2021-05-04T23:59:59+02:00',
                                    value: 100,
                                },
                            ],
                        },
                    ],
                    timeSeries: [
                        {
                            dateTime: '2021-05-01T00:00:00+02:00',
                            value: 50,
                        },
                        {
                            dateTime: '2021-05-02T00:00:00+02:00',
                            value: 50,
                        },
                        {
                            dateTime: '2021-05-03T00:00:00+02:00',
                            value: 0,
                        },
                        {
                            dateTime: '2021-05-04T23:59:59+02:00',
                            value: 50,
                        },
                    ],
                },
                {
                    'TicketCustomFields.ticketCount': 50,
                    'TicketCustomFields.valueString': 'asd',
                    children: [
                        {
                            'TicketCustomFields.ticketCount': 100,
                            'TicketCustomFields.valueString': 'qwe',
                            children: [],
                            timeSeries: [
                                {
                                    dateTime: '2021-05-01T00:00:00+02:00',
                                    value: 100,
                                },
                                {
                                    dateTime: '2021-05-02T00:00:00+02:00',
                                    value: 100,
                                },
                                {
                                    dateTime: '2021-05-03T00:00:00+02:00',
                                    value: 0,
                                },
                                {
                                    dateTime: '2021-05-04T23:59:59+02:00',
                                    value: 100,
                                },
                            ],
                        },
                    ],
                    timeSeries: [
                        {
                            dateTime: '2021-05-01T00:00:00+02:00',
                            value: 50,
                        },
                        {
                            dateTime: '2021-05-02T00:00:00+02:00',
                            value: 50,
                        },
                        {
                            dateTime: '2021-05-03T00:00:00+02:00',
                            value: 0,
                        },
                        {
                            dateTime: '2021-05-04T23:59:59+02:00',
                            value: 50,
                        },
                    ],
                },
            ])
        })
    })
})
