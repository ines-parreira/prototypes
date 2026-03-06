import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import _zip from 'lodash/zip'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    calculateDecile,
    enrichWithPercentagesAndDeciles,
    useCustomFieldsTicketCountPerCustomFields,
} from 'domains/reporting/hooks/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import { useCustomFieldsTicketCountTimeSeries } from 'domains/reporting/hooks/timeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    BREAKDOWN_FIELD,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    getCustomFieldsOrder,
    getValueMode,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { ValueMode } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import type { RootState, StoreDispatch } from 'state/types'
import { notUndefined } from 'utils/types'

const mockStore = configureMockStore<RootState, StoreDispatch>()
jest.mock('domains/reporting/hooks/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('domains/reporting/state/ui/stats/ticketInsightsSlice')
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
    const defaultStatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const defaultOrder = {
        direction: OrderDirection.Desc,
        column: 'label' as const,
    }
    const isLoading = false

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
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

    it('should select value per dimension and dateTime', () => {
        const { result } = renderHook(
            () =>
                useCustomFieldsTicketCountPerCustomFields(
                    selectedCustomFieldId,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore({} as any)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [
                {
                    [VALUE_FIELD]: 668,
                    [BREAKDOWN_FIELD]: 'abc',
                    initialCustomFieldValue: [customField],
                    decile: 9,
                    percentage: 100,
                    totalsDecile: 9,
                    children: [
                        {
                            [VALUE_FIELD]: 668,
                            [BREAKDOWN_FIELD]: 'xyz',
                            initialCustomFieldValue: [customField],
                            children: [],
                            decile: 9,
                            totalsDecile: 9,
                            percentage: 100,
                            timeSeries: [
                                {
                                    dateTime: startDate,
                                    decile: 9,
                                    totalsDecile: 9,
                                    percentage: 100,
                                    value: 456,
                                },
                                {
                                    dateTime: day2,
                                    decile: 9,
                                    totalsDecile: 3,
                                    percentage: 100,
                                    value: 123,
                                },
                                {
                                    dateTime: day3,
                                    decile: 0,
                                    totalsDecile: 0,
                                    percentage: 0,
                                    value: 0,
                                },
                                {
                                    dateTime: endDate,
                                    decile: 9,
                                    totalsDecile: 2,
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
                            totalsDecile: 9,
                            percentage: 100,
                            value: 456,
                        },
                        {
                            dateTime: day2,
                            decile: 9,
                            totalsDecile: 3,
                            percentage: 100,
                            value: 123,
                        },
                        {
                            dateTime: day3,
                            decile: 0,
                            totalsDecile: 0,
                            percentage: 0,
                            value: 0,
                        },
                        {
                            dateTime: endDate,
                            decile: 9,
                            totalsDecile: 2,
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

        const { result } = renderHook(
            () =>
                useCustomFieldsTicketCountPerCustomFields(
                    selectedCustomFieldId,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore({} as any)}>{children}</Provider>
                ),
            },
        )

        expect(result.current.data).toEqual([])
    })

    describe('enrichWithPercentagesAndDeciles', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const tag1DailyValues = [400, 123, 0, 75]
        const tag2DailyValues = [100, 0, 10, 25]
        const customField1 = 'abc::xyz'
        const customField2 = 'asd::qwe'
        const input = [
            {
                [VALUE_FIELD]: tag1DailyValues.reduce((sum, v) => sum + v),
                [BREAKDOWN_FIELD]: 'abc',
                initialCustomFieldValue: [customField1],
                children: [
                    {
                        [VALUE_FIELD]: tag1DailyValues.reduce(
                            (sum, v) => sum + v,
                        ),
                        [BREAKDOWN_FIELD]: 'xyz',
                        initialCustomFieldValue: null,
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
                initialCustomFieldValue: [customField2],
                children: [
                    {
                        [VALUE_FIELD]: tag2DailyValues.reduce(
                            (sum, v) => sum + v,
                        ),
                        [BREAKDOWN_FIELD]: 'qwe',
                        initialCustomFieldValue: null,
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

        const calculatePercentageOfPerColumn = (
            tagValues: number[],
            column: number,
        ) => {
            const baseValue = tagValues[column]
            const zipped = _zip(tag1DailyValues, tag2DailyValues)
            const columnSum = zipped
                .map((day) =>
                    day.reduce((sum, v) => Number(sum) + Number(v), 0),
                )
                .filter(notUndefined)

            return (baseValue / columnSum[column]) * 100
        }

        it('should calculate percentages and deciles', () => {
            const result = enrichWithPercentagesAndDeciles(input, VALUE_FIELD)
            const maximumTopLevelValue = Math.max(
                ...tag1DailyValues,
                ...tag2DailyValues,
            )

            expect(result).toEqual([
                {
                    [VALUE_FIELD]: tag1DailyValues.reduce((sum, v) => sum + v),
                    [BREAKDOWN_FIELD]: 'abc',
                    initialCustomFieldValue: [customField1],
                    children: [
                        {
                            [VALUE_FIELD]: tag1DailyValues.reduce(
                                (sum, v) => sum + v,
                            ),
                            [BREAKDOWN_FIELD]: 'xyz',
                            initialCustomFieldValue: null,
                            children: [],
                            decile: calculateDecile(
                                tag1DailyValues.reduce((sum, v) => sum + v),
                                [...tag1DailyValues, ...tag2DailyValues].reduce(
                                    (sum, v) => sum + v,
                                ),
                            ),
                            totalsDecile: calculateDecile(
                                tag1DailyValues.reduce((sum, v) => sum + v),
                                maximumTopLevelValue,
                            ),
                            percentage:
                                (tag1DailyValues.reduce((sum, v) => sum + v) /
                                    [
                                        ...tag1DailyValues,
                                        ...tag2DailyValues,
                                    ].reduce((sum, v) => sum + v)) *
                                100,
                            timeSeries: [
                                {
                                    dateTime: startDate,
                                    decile: calculateDecile(
                                        tag1DailyValues[0],
                                        tag1DailyValues[0] + tag2DailyValues[0],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[0],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        0,
                                    ),
                                    value: tag1DailyValues[0],
                                },
                                {
                                    dateTime: day2,
                                    decile: calculateDecile(
                                        tag1DailyValues[1],
                                        tag1DailyValues[1] + tag2DailyValues[1],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[1],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        1,
                                    ),
                                    value: tag1DailyValues[1],
                                },
                                {
                                    dateTime: day3,
                                    decile: calculateDecile(
                                        tag1DailyValues[2],
                                        tag1DailyValues[2] + tag2DailyValues[2],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[2],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        2,
                                    ),
                                    value: tag1DailyValues[2],
                                },
                                {
                                    dateTime: endDate,
                                    decile: calculateDecile(
                                        tag1DailyValues[3],
                                        tag1DailyValues[3] + tag2DailyValues[3],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[3],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        3,
                                    ),
                                    value: tag1DailyValues[3],
                                },
                            ],
                        },
                    ],
                    decile: calculateDecile(
                        tag1DailyValues.reduce((sum, v) => sum + v),
                        [...tag1DailyValues, ...tag2DailyValues].reduce(
                            (sum, v) => sum + v,
                        ),
                    ),
                    totalsDecile: calculateDecile(
                        tag1DailyValues.reduce((sum, v) => sum + v),
                        maximumTopLevelValue,
                    ),
                    percentage:
                        (tag1DailyValues.reduce((sum, v) => sum + v) /
                            [...tag1DailyValues, ...tag2DailyValues].reduce(
                                (sum, v) => sum + v,
                            )) *
                        100,
                    timeSeries: [
                        {
                            dateTime: startDate,
                            decile: calculateDecile(
                                tag1DailyValues[0],
                                tag1DailyValues[0] + tag2DailyValues[0],
                            ),
                            totalsDecile: calculateDecile(
                                tag1DailyValues[0],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag1DailyValues,
                                0,
                            ),
                            value: tag1DailyValues[0],
                        },
                        {
                            dateTime: day2,
                            decile: calculateDecile(
                                tag1DailyValues[1],
                                tag1DailyValues[1] + tag2DailyValues[1],
                            ),
                            totalsDecile: calculateDecile(
                                tag1DailyValues[1],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag1DailyValues,
                                1,
                            ),
                            value: tag1DailyValues[1],
                        },
                        {
                            dateTime: day3,
                            decile: calculateDecile(
                                tag1DailyValues[2],
                                tag1DailyValues[2] + tag2DailyValues[2],
                            ),
                            totalsDecile: calculateDecile(
                                tag1DailyValues[2],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag1DailyValues,
                                2,
                            ),
                            value: tag1DailyValues[2],
                        },
                        {
                            dateTime: endDate,
                            decile: calculateDecile(
                                tag1DailyValues[3],
                                tag1DailyValues[3] + tag2DailyValues[3],
                            ),
                            totalsDecile: calculateDecile(
                                tag1DailyValues[3],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag1DailyValues,
                                3,
                            ),
                            value: tag1DailyValues[3],
                        },
                    ],
                },
                {
                    [VALUE_FIELD]: tag2DailyValues.reduce((sum, v) => sum + v),
                    [BREAKDOWN_FIELD]: 'asd',
                    initialCustomFieldValue: [customField2],
                    children: [
                        {
                            [VALUE_FIELD]: tag2DailyValues.reduce(
                                (sum, v) => sum + v,
                            ),
                            [BREAKDOWN_FIELD]: 'qwe',
                            initialCustomFieldValue: null,
                            children: [],
                            decile: calculateDecile(
                                tag2DailyValues.reduce((sum, v) => sum + v),
                                [...tag1DailyValues, ...tag2DailyValues].reduce(
                                    (sum, v) => sum + v,
                                ),
                            ),
                            totalsDecile: calculateDecile(
                                tag2DailyValues.reduce((sum, v) => sum + v),
                                maximumTopLevelValue,
                            ),
                            percentage:
                                (tag2DailyValues.reduce((sum, v) => sum + v) /
                                    [
                                        ...tag1DailyValues,
                                        ...tag2DailyValues,
                                    ].reduce((sum, v) => sum + v)) *
                                100,
                            timeSeries: [
                                {
                                    dateTime: startDate,
                                    decile: calculateDecile(
                                        tag1DailyValues[0],
                                        tag1DailyValues[0] + tag2DailyValues[0],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[0],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        0,
                                    ),
                                    value: tag1DailyValues[0],
                                },
                                {
                                    dateTime: day2,
                                    decile: calculateDecile(
                                        tag1DailyValues[1],
                                        tag1DailyValues[1] + tag2DailyValues[1],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[1],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        1,
                                    ),
                                    value: tag1DailyValues[1],
                                },
                                {
                                    dateTime: day3,
                                    decile: calculateDecile(
                                        tag1DailyValues[2],
                                        tag1DailyValues[2] + tag2DailyValues[2],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[2],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        2,
                                    ),
                                    value: tag1DailyValues[2],
                                },
                                {
                                    dateTime: endDate,
                                    decile: calculateDecile(
                                        tag1DailyValues[3],
                                        tag1DailyValues[3] + tag2DailyValues[3],
                                    ),
                                    totalsDecile: calculateDecile(
                                        tag1DailyValues[3],
                                        maximumTopLevelValue,
                                    ),
                                    percentage: calculatePercentageOfPerColumn(
                                        tag1DailyValues,
                                        3,
                                    ),
                                    value: tag1DailyValues[3],
                                },
                            ],
                        },
                    ],
                    decile: calculateDecile(
                        tag2DailyValues.reduce((sum, v) => sum + v),
                        [...tag1DailyValues, ...tag2DailyValues].reduce(
                            (sum, v) => sum + v,
                        ),
                    ),
                    totalsDecile: calculateDecile(
                        tag2DailyValues.reduce((sum, v) => sum + v),
                        maximumTopLevelValue,
                    ),
                    percentage:
                        (tag2DailyValues.reduce((sum, v) => sum + v) /
                            [...tag1DailyValues, ...tag2DailyValues].reduce(
                                (sum, v) => sum + v,
                            )) *
                        100,
                    timeSeries: [
                        {
                            dateTime: startDate,
                            decile: calculateDecile(
                                tag2DailyValues[0],
                                tag1DailyValues[0] + tag2DailyValues[0],
                            ),
                            totalsDecile: calculateDecile(
                                tag2DailyValues[0],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag2DailyValues,
                                0,
                            ),
                            value: tag2DailyValues[0],
                        },
                        {
                            dateTime: day2,
                            decile: calculateDecile(
                                tag2DailyValues[1],
                                tag1DailyValues[1] + tag2DailyValues[1],
                            ),
                            totalsDecile: calculateDecile(
                                tag2DailyValues[1],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag2DailyValues,
                                1,
                            ),
                            value: tag2DailyValues[1],
                        },
                        {
                            dateTime: day3,
                            decile: calculateDecile(
                                tag2DailyValues[2],
                                tag1DailyValues[2] + tag2DailyValues[2],
                            ),
                            totalsDecile: calculateDecile(
                                tag2DailyValues[2],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag2DailyValues,
                                2,
                            ),
                            value: tag2DailyValues[2],
                        },
                        {
                            dateTime: endDate,
                            decile: calculateDecile(
                                tag2DailyValues[3],
                                tag1DailyValues[3] + tag2DailyValues[3],
                            ),
                            totalsDecile: calculateDecile(
                                tag2DailyValues[3],
                                maximumTopLevelValue,
                            ),
                            percentage: calculatePercentageOfPerColumn(
                                tag2DailyValues,
                                3,
                            ),
                            value: tag2DailyValues[3],
                        },
                    ],
                },
            ])
        })
    })
})
