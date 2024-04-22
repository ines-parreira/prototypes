import React, {ComponentType} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _keyBy from 'lodash/keyBy'
import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment/moment'
import {tags} from 'fixtures/tag'
import {RootState} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'
import {StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'

import {
    findChannelNameKey,
    formatDuration,
    formatMetricTrend,
    formatMetricValue,
    formatNumber,
    formatTimeSeriesData,
    formatLabeledTooltipTimeSeriesData,
    SHORT_FORMAT,
    NOT_AVAILABLE_TEXT,
    useStatsViewFilters,
    periodPickerMaxSpanDays,
    NOT_AVAILABLE_PLACEHOLDER,
    startOfToday,
    endOfToday,
    dateInPastFromStartOfToday,
    startOfMonth,
    startOfLastMonth,
    endOfLastMonth,
    startOfYear,
    lastYearStart,
    lastYearEnd,
    lastWeekDateRange,
    StartDayOfWeek,
} from '../utils'

const mockStore = configureMockStore([thunk])

describe('stats components utils', () => {
    describe('formatNumber', () => {
        it.each([
            [123, '123'],
            [123456, '123,456'],
            [123456789, '123,456,789'],
            [4.56, '4.56'],
        ])('should format the number properly', (value, result) => {
            expect(formatNumber(value)).toBe(result)
        })
    })

    describe('useStatsViewFilters', () => {
        const defaultState = {
            entities: {
                tags: _keyBy(tags, 'id'),
            },
        } as RootState
        const defaultStatsFilters: StatsFilters = {
            period: {
                start_datetime: '2021-05-29T00:00:00+02:00',
                end_datetime: '2021-06-04T23:59:59+04:00',
            },
        }

        it.each<[string, StatsFilters]>([
            ['period', defaultStatsFilters],
            [
                'single channel',
                {
                    ...defaultStatsFilters,
                    channels: [TicketChannel.Email],
                },
            ],
            [
                'multiple channels',
                {
                    ...defaultStatsFilters,
                    channels: [TicketChannel.Email, TicketChannel.Chat],
                },
            ],
            [
                'single integration',
                {
                    ...defaultStatsFilters,
                    integrations: [1],
                },
            ],
            [
                'multiple integrations',
                {
                    ...defaultStatsFilters,
                    integrations: [1, 5],
                },
            ],
            [
                'single agent',
                {
                    ...defaultStatsFilters,
                    agents: [1],
                },
            ],
            [
                'multiple agents',
                {
                    ...defaultStatsFilters,
                    agents: [1, 2, 3],
                },
            ],
            [
                'tags',
                {
                    ...defaultStatsFilters,
                    tags: [tags[0].id],
                },
            ],
        ])('should return view filters for %s', (testName, statsFilters) => {
            const wrapper: ComponentType = ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider value={statsFilters}>
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const {result} = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                {wrapper}
            )

            expect(result.current).toMatchSnapshot()
        })

        it('should not include a view filter if the corresponding stat filter is an empty array', () => {
            const wrapper: ComponentType = ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider
                        value={{
                            ...defaultStatsFilters,
                            integrations: [],
                            agents: [],
                            channels: [],
                            tags: [],
                            score: [],
                        }}
                    >
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const {result} = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                {wrapper}
            )

            expect(result.current).toMatchSnapshot()
        })

        it("should not include tags that don't exist in the store", () => {
            const wrapper: ComponentType = ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider
                        value={{
                            ...defaultStatsFilters,
                            tags: [99999],
                        }}
                    >
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const {result} = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                {wrapper}
            )

            expect(result.current).toMatchSnapshot()
        })
    })

    describe('formatDuration', () => {
        it.each<[string, number, string]>([
            ['empty value', 0, '0s'],
            ['second', 1, '1s'],
            ['minute', 60, '1m'],
            ['hour', 3600, '1h'],
            ['day', 24 * 3600, '1d'],
            ['month', 24 * 3600 * 31, '1mo'],
        ])('should match template for %s', (testName, duration, expected) => {
            expect(formatDuration(duration)).toBe(expected)
        })
        it.each<[number, string]>([
            [1, '1mo'],
            [2, '1mo 01d'],
            [3, '1mo 01d 01h'],
            [4, '1mo 01d 01h 01m'],
            [5, '1mo 01d 01h 01m 01s'],
        ])('should match template for precision %i', (precision, expected) => {
            const duration = 24 * 3600 * 31 + 24 * 3600 + 3600 + 60 + 1
            expect(formatDuration(duration, precision)).toBe(expected)
        })
    })

    describe('findChannelNameKey', () => {
        it('should return the correct channel name key', () => {
            const key = findChannelNameKey('Facebook Mention')
            expect(key).toBe(TicketChannel.FacebookMention)
        })

        it('should return undefined when key is unknown', () => {
            const key = findChannelNameKey('Something else')
            expect(key).toBeUndefined()
        })
    })

    describe('formatMetricValue', () => {
        it('should format value up to two decimal places when format is "decimal"', () => {
            expect(formatMetricValue(123456.789, 'decimal')).toBe('123,456.79')
        })

        it('should format rounded value when format is "integer"', () => {
            const value = 123456.789

            expect(formatMetricValue(value, 'integer')).toBe('123,457')
        })

        it('should format value up to two decimal places and render as percentage when format is "percentage"', () => {
            expect(formatMetricValue(123456.789, 'percent')).toBe('123,456.79%')
        })

        it('should format value as duration with precision two when format is "duration"', () => {
            const minuteInSeconds = 60
            const hourInSeconds = 60 * minuteInSeconds
            const dayInSeconds = 24 * hourInSeconds

            expect(
                formatMetricValue(
                    5 * dayInSeconds +
                        17 * hourInSeconds +
                        42 * minuteInSeconds +
                        33,
                    'duration'
                )
            ).toBe('5d 17h')
        })

        it('should return fallback when value is null', () => {
            expect(formatMetricValue(null, 'decimal')).toBe(NOT_AVAILABLE_TEXT)
        })
    })

    describe('formatMetricTrend', () => {
        it('should format trend up to one decimal when format is "decimal"', () => {
            expect(formatMetricTrend(13.14, 10, 'decimal')).toMatchObject({
                formattedTrend: '3.1',
                sign: 1,
            })
        })

        it('should format trend as duration with precision one when format is "duration"', () => {
            const minuteInSeconds = 60

            expect(
                formatMetricTrend(
                    38 * minuteInSeconds + 15,
                    21 * minuteInSeconds + 6,
                    'duration'
                )
            ).toMatchObject({
                formattedTrend: '17m',
                sign: 1,
            })
        })

        it('should format trend as percent with no decimal places when format is "percent"', () => {
            expect(formatMetricTrend(2.3, 1.2, 'percent')).toMatchObject({
                formattedTrend: '92%',
                sign: 1,
            })
        })

        it('should return null when current value is non-zero and prev value is zero and the format is percent', () => {
            expect(formatMetricTrend(2.3, 0, 'percent')).toMatchObject({
                formattedTrend: null,
            })
        })

        it('should format trend as 0 when current value is zero and prev value is zero and the format is percent', () => {
            expect(formatMetricTrend(0, 0, 'percent')).toMatchObject({
                formattedTrend: '0%',
            })
        })
        it('should not return +0% when the result is to the degree of thousands and the format is percent', () => {
            expect(formatMetricTrend(1001, 1000, 'percent')).not.toMatchObject({
                formattedTrend: '0%',
                sign: 1,
            })
        })
        it('should not return -0% when the result is to the degree of thousands and the format is percent', () => {
            expect(formatMetricTrend(1000, 1001, 'percent')).not.toMatchObject({
                formattedTrend: '0%',
                sign: -1,
            })
        })
    })

    describe('formatTimeSeriesData', () => {
        it('should return the time series data for line chart', () => {
            expect(
                formatTimeSeriesData(
                    [
                        [
                            {
                                dateTime: '2020-01-01T00:00:00.000',
                                value: 1,
                            },
                            {
                                dateTime: '2020-01-01T00:00:00.000',
                                value: 2,
                            },
                        ],
                    ],
                    'test label',
                    ReportingGranularity.Month
                )
            ).toMatchObject([
                {
                    label: 'test label',
                    values: [
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT
                            ),
                            y: 1,
                        },
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT
                            ),
                            y: 2,
                        },
                    ],
                },
            ])
        })

        it('should format the dates to show month day and year', () => {
            expect(
                formatTimeSeriesData(
                    [[{dateTime: '2020-01-01T00:00:00.000', value: 1}]],
                    'test label',
                    ReportingGranularity.Month
                )
            ).toMatchObject([
                {
                    label: 'test label',
                    values: [
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT
                            ),
                            y: 1,
                        },
                    ],
                },
            ])
        })

        it('should format the dates to show hour when granularity is "hour"', () => {
            expect(
                formatTimeSeriesData(
                    [[{dateTime: '2020-01-01T00:00:00.000', value: 2}]],
                    'test label',
                    ReportingGranularity.Hour
                )
            ).toMatchObject([
                {label: 'test label', values: [{x: '12:00 AM', y: 2}]},
            ])
        })
    })

    describe('formatLabeledTooltipTimeSeriesData', () => {
        it('should return the time series data with tooltip for line chart legend', () => {
            expect(
                formatLabeledTooltipTimeSeriesData(
                    [
                        [
                            {
                                dateTime: '2020-01-01T00:00:00.000',
                                value: 1,
                            },
                            {
                                dateTime: '2020-01-01T00:00:00.000',
                                value: 2,
                            },
                        ],
                    ],
                    {labels: ['test label'], tooltips: ['test tooltip']},
                    ReportingGranularity.Month
                )
            ).toMatchObject([
                {
                    label: 'test label',
                    tooltip: 'test tooltip',
                    values: [
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT
                            ),
                            y: 1,
                        },
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT
                            ),
                            y: 2,
                        },
                    ],
                },
            ])
        })
    })
    describe('periodPickerMaxSpanDays', () => {
        it('returns placeholder when no max span and no min date provided', () => {
            expect(periodPickerMaxSpanDays()).toEqual(NOT_AVAILABLE_PLACEHOLDER)
        })

        it('returns provided max span when specified', () => {
            const maxSpan = 90
            expect(periodPickerMaxSpanDays(maxSpan)).toEqual(maxSpan)
        })

        it('returns placeholder when there is no max span and min date is provided', () => {
            expect(
                periodPickerMaxSpanDays(undefined, moment().subtract(5, 'days'))
            ).toEqual(NOT_AVAILABLE_PLACEHOLDER)
        })

        it('returns days difference when minDate is in the past within the max span', () => {
            const maxSpan = 200
            const minDate = moment().subtract(100, 'days')
            expect(periodPickerMaxSpanDays(maxSpan, minDate)).toEqual(100)
        })

        it('returns provided max span when minDate is in the past beyond the max span', () => {
            const maxSpan = 100
            const minDate = moment().subtract(200, 'days')
            expect(periodPickerMaxSpanDays(maxSpan, minDate)).toEqual(maxSpan)
        })
    })

    describe('test date ranges', () => {
        beforeEach(() => {
            Date.now = jest
                .fn()
                .mockReturnValue(new Date('2023-05-16T15:21:16.000Z'))
        })

        const formatOfDate = 'DD/MM/YYYY HH:mm:ss'

        it.each([
            {method: startOfToday, expectedResult: '16/05/2023 00:00:00'},
            {method: endOfToday, expectedResult: '16/05/2023 23:59:59'},
            {method: startOfMonth, expectedResult: '01/05/2023 00:00:00'},
            {method: startOfLastMonth, expectedResult: '01/04/2023 00:00:00'},
            {method: endOfLastMonth, expectedResult: '30/04/2023 23:59:59'},
            {method: startOfYear, expectedResult: '01/01/2023 00:00:00'},
            {method: lastYearStart, expectedResult: '01/01/2022 00:00:00'},
            {method: lastYearEnd, expectedResult: '31/12/2022 23:59:59'},
        ])(
            'should check if $method.name returns $expectedResult',
            ({method, expectedResult}) => {
                expect(method().format(formatOfDate)).toBe(expectedResult)
            }
        )

        it.each([
            {
                weekStartDay: StartDayOfWeek.Sunday,
                expectedResults: {
                    start: '07/05/2023 00:00:00',
                    end: '13/05/2023 23:59:59',
                },
            },
            {
                weekStartDay: StartDayOfWeek.Monday,
                expectedResults: {
                    start: '08/05/2023 00:00:00',
                    end: '14/05/2023 23:59:59',
                },
            },
        ])(
            'should check if lastWeekDateRange returns correct dates for $weekStartDay',
            ({weekStartDay, expectedResults}) => {
                expect(
                    lastWeekDateRange(weekStartDay).start.format(formatOfDate)
                ).toBe(expectedResults.start)
                expect(
                    lastWeekDateRange(weekStartDay).end.format(formatOfDate)
                ).toBe(expectedResults.end)
            }
        )

        it.each([
            {daysFromToday: 7, expectedResult: '10/05/2023 00:00:00'},
            {daysFromToday: 30, expectedResult: '17/04/2023 00:00:00'},
            {daysFromToday: 60, expectedResult: '18/03/2023 00:00:00'},
            {daysFromToday: 90, expectedResult: '16/02/2023 00:00:00'},
        ])(
            'should check if dateInPastFromStartOfToday returns $expectedResult for $daysFromToday days',
            ({daysFromToday, expectedResult}) => {
                expect(
                    dateInPastFromStartOfToday(daysFromToday).format(
                        formatOfDate
                    )
                ).toBe(expectedResult)
            }
        )
    })
})
