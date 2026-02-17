import type React from 'react'

import { UNDEFINED_VARIATION_TEXT } from '@repo/reporting'
import { renderHook } from '@repo/testing'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import _keyBy from 'lodash/keyBy'
import moment from 'moment/moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { AnalyticsFilter } from '@gorgias/helpdesk-queries'

import { TicketChannel } from 'business/types/ticket'
import type {
    LegacyStatsFilters,
    SavedFilterDraft,
} from 'domains/reporting/models/stat/types'
import {
    FilterKey,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    areFiltersEqual,
    getFormattedFilter,
} from 'domains/reporting/pages/common/filters/utils'
import {
    dateInPastFromStartOfToday,
    endOfLastMonth,
    endOfToday,
    formatDuration,
    formatLabeledTooltipTimeSeriesData,
    formatMetricTrend,
    formatMetricValue,
    formatNumber,
    formatTimeSeriesData,
    getDateRangePickerLabel,
    getFormattedDelta,
    getFormattedPercentage,
    last365DaysStartingFromToday,
    lastWeekDateRange,
    move,
    NOT_AVAILABLE_PLACEHOLDER,
    NOT_AVAILABLE_TEXT,
    periodPickerMaxSpanDays,
    SHORT_FORMAT,
    StartDayOfWeek,
    startOfLastMonth,
    startOfMonth,
    startOfToday,
    startOfYear,
    useStatsViewFilters,
} from 'domains/reporting/pages/common/utils'
import StatsFiltersContext from 'domains/reporting/pages/StatsFiltersContext'
import { tags } from 'fixtures/tag'
import type { RootState } from 'state/types'

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
        const defaultStatsFilters: LegacyStatsFilters = {
            period: {
                start_datetime: '2021-05-29T00:00:00+02:00',
                end_datetime: '2021-06-04T23:59:59+04:00',
            },
        }

        it.each<[string, LegacyStatsFilters]>([
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
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({
                children,
            }) => (
                <Provider store={mockStore(defaultState)}>
                    <StatsFiltersContext.Provider value={statsFilters}>
                        {children}
                    </StatsFiltersContext.Provider>
                </Provider>
            )

            const { result } = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                { wrapper },
            )

            expect(result.current).toMatchSnapshot()
        })

        it('should not include a view filter if the corresponding stat filter is an empty array', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({
                children,
            }) => (
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

            const { result } = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                { wrapper },
            )

            expect(result.current).toMatchSnapshot()
        })

        it("should not include tags that don't exist in the store", () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({
                children,
            }) => (
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

            const { result } = renderHook(
                () => {
                    return useStatsViewFilters('ticket.created_datetime')
                },
                { wrapper },
            )

            expect(result.current).toMatchSnapshot()
        })
    })

    describe('formatDuration', () => {
        it.each<[string, number, string]>([
            ['negative second', -20, '-20s'],
            ['empty value', 0, '0s'],
            ['less than a second', 0.6, '0s'],
            ['second', 1, '1s'],
            ['second with decimal', 1.8, '1s'],
            ['minute', 60, '1m'],
            ['hour', 3600, '1h'],
            ['day', 24 * 3600, '1d'],
            ['month', 24 * 3600 * 31, '1mo'],
            ['year', 24 * 3600 * 365 * 2, '1y 11mo 29d'],
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

        it.each<[number, string]>([
            [1, '2y'],
            [2, '2y 1mo'],
            [3, '2y 1mo 01d'],
            [4, '2y 1mo 01d 01h'],
            [5, '2y 1mo 01d 01h 01m'],
            [6, '2y 1mo 01d 01h 01m 01s'],
        ])(
            'should match template with year for precision %i',
            (precision, expected) => {
                const duration =
                    24 * 3600 * 365 * 2 +
                    24 * 3600 * 31 +
                    24 * 3600 +
                    3600 +
                    60 +
                    1
                expect(formatDuration(duration, precision)).toBe(expected)
            },
        )
    })

    describe('formatMetricValue', () => {
        it('should format value up to two decimal places when format is "decimal"', () => {
            expect(formatMetricValue(123456.789, 'decimal')).toBe('123,456.79')
        })

        it('should format value up to one decimal place when format is "decimal-precision-1"', () => {
            expect(formatMetricValue(123456.789, 'decimal-precision-1')).toBe(
                '123,456.8',
            )
        })

        it('should format rounded value when format is "integer"', () => {
            const value = 123456.789

            expect(formatMetricValue(value, 'integer')).toBe('123,457')
        })

        it('should format value up to two decimal places and render as percentage when format is "percent"', () => {
            expect(formatMetricValue(123456.789, 'percent')).toBe('123,456.79%')
        })

        it('should format and round value up to one decimal places and render as percentage when format is "percent-precision-1"', () => {
            expect(formatMetricValue(123456.789, 'percent-precision-1')).toBe(
                '123,456.8%',
            )
        })

        it('should format value up to one decimal place and representing percentage when format is "decimal-to-percent-precision-1"', () => {
            expect(
                formatMetricValue(123456.789, 'decimal-to-percent-precision-1'),
            ).toBe('12,345,678.9%')
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
                    'duration',
                ),
            ).toBe('5d 17h')
        })

        it('should return fallback when value is null', () => {
            expect(formatMetricValue(null, 'decimal')).toBe(NOT_AVAILABLE_TEXT)
        })

        it('should return fallback when value is NaN', () => {
            expect(formatMetricValue(NaN, 'decimal')).toBe(NOT_AVAILABLE_TEXT)
        })

        it('should return percent on 0-1 float representing percentage', () => {
            expect(formatMetricValue(0.5, 'decimal-to-percent')).toBe('50%')
        })

        it('should round number to closest integer (up) when format is "decimal-percent-to-integer-percent"', () => {
            expect(
                formatMetricValue(0.555, 'decimal-percent-to-integer-percent'),
            ).toBe('56%')
        })

        it('should round number to closest integer (down) when format is "decimal-percent-to-integer-percent"', () => {
            expect(
                formatMetricValue(0.352, 'decimal-percent-to-integer-percent'),
            ).toBe('35%')
        })

        it('should show $ sign when format is "currency" and currency not specified', () => {
            expect(formatMetricValue(123456.789, 'currency')).toBe(
                '$123,456.79',
            )
        })

        it('should show $ sign when format is "currency" and currency is specified', () => {
            expect(
                formatMetricValue(123456.789, 'currency', undefined, 'JPY'),
            ).toBe('¥123,456.79')
        })

        it('should show $ sign and display up to 1 decimal place when format is "currency-precision-1" and currency is specified', () => {
            expect(
                formatMetricValue(
                    123456.789,
                    'currency-precision-1',
                    undefined,
                    'JPY',
                ),
            ).toBe('¥123,456.8')
        })

        it('should render `x` sign if format is ratio', () => {
            expect(formatMetricValue(1.23, 'ratio')).toBe('1.23x')
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
                    'duration',
                ),
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

        it('should return undefined variation text when current value is non-zero and prev value is zero and the format is percent', () => {
            expect(formatMetricTrend(2.3, 0, 'percent')).toMatchObject({
                formattedTrend: UNDEFINED_VARIATION_TEXT,
                sign: 0,
            })
        })

        it('should format trend as 0 when current value is zero and prev value is zero and the format is percent', () => {
            expect(formatMetricTrend(0, 0, 'percent')).toMatchObject({
                formattedTrend: '0%',
            })
        })

        describe('division by zero edge cases', () => {
            it('should return undefined variation text when prevValue is 0 and value is positive', () => {
                expect(formatMetricTrend(10, 0, 'percent')).toMatchObject({
                    formattedTrend: UNDEFINED_VARIATION_TEXT,
                    sign: 0,
                })
            })

            it('should return undefined variation text when prevValue is 0 and value is negative', () => {
                expect(formatMetricTrend(-5, 0, 'percent')).toMatchObject({
                    formattedTrend: UNDEFINED_VARIATION_TEXT,
                    sign: 0,
                })
            })

            it('should return 0% when both values are 0', () => {
                expect(formatMetricTrend(0, 0, 'percent')).toMatchObject({
                    formattedTrend: '0%',
                    sign: 0,
                })
            })

            it('should return undefined variation text for decimal-to-percent format when prevValue is 0', () => {
                expect(
                    formatMetricTrend(1.5, 0, 'decimal-to-percent'),
                ).toMatchObject({
                    formattedTrend: UNDEFINED_VARIATION_TEXT,
                    sign: 0,
                })
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
                    ReportingGranularity.Month,
                ),
            ).toMatchObject([
                {
                    label: 'test label',
                    values: [
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT,
                            ),
                            y: 1,
                        },
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT,
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
                    [[{ dateTime: '2020-01-01T00:00:00.000', value: 1 }]],
                    'test label',
                    ReportingGranularity.Month,
                ),
            ).toMatchObject([
                {
                    label: 'test label',
                    values: [
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT,
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
                    [[{ dateTime: '2020-01-01T00:00:00.000', value: 2 }]],
                    'test label',
                    ReportingGranularity.Hour,
                ),
            ).toMatchObject([
                { label: 'test label', values: [{ x: '12:00 AM', y: 2 }] },
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
                    { labels: ['test label'], tooltips: ['test tooltip'] },
                    ReportingGranularity.Month,
                ),
            ).toMatchObject([
                {
                    label: 'test label',
                    tooltip: 'test tooltip',
                    values: [
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT,
                            ),
                            y: 1,
                        },
                        {
                            x: moment('2020-01-01T00:00:00.000').format(
                                SHORT_FORMAT,
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
                periodPickerMaxSpanDays(
                    undefined,
                    moment().subtract(5, 'days'),
                ),
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
            { method: startOfToday, expectedResult: '16/05/2023 00:00:00' },
            { method: endOfToday, expectedResult: '16/05/2023 23:59:59' },
            { method: startOfMonth, expectedResult: '01/05/2023 00:00:00' },
            { method: startOfLastMonth, expectedResult: '01/04/2023 00:00:00' },
            { method: endOfLastMonth, expectedResult: '30/04/2023 23:59:59' },
            { method: startOfYear, expectedResult: '01/01/2023 00:00:00' },
            {
                method: last365DaysStartingFromToday,
                expectedResult: '16/05/2022 00:00:00',
            },
        ])(
            'should check if $method.name returns $expectedResult',
            ({ method, expectedResult }) => {
                expect(method().format(formatOfDate)).toBe(expectedResult)
            },
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
            ({ weekStartDay, expectedResults }) => {
                expect(
                    lastWeekDateRange(weekStartDay).start.format(formatOfDate),
                ).toBe(expectedResults.start)
                expect(
                    lastWeekDateRange(weekStartDay).end.format(formatOfDate),
                ).toBe(expectedResults.end)
            },
        )

        it.each([
            { daysFromToday: 7, expectedResult: '10/05/2023 00:00:00' },
            { daysFromToday: 30, expectedResult: '17/04/2023 00:00:00' },
            { daysFromToday: 60, expectedResult: '18/03/2023 00:00:00' },
            { daysFromToday: 90, expectedResult: '16/02/2023 00:00:00' },
        ])(
            'should check if dateInPastFromStartOfToday returns $expectedResult for $daysFromToday days',
            ({ daysFromToday, expectedResult }) => {
                expect(
                    dateInPastFromStartOfToday(daysFromToday).format(
                        formatOfDate,
                    ),
                ).toBe(expectedResult)
            },
        )
    })

    describe('getDateRangePickerLabel', () => {
        it.each([
            {
                period: {
                    startDate: moment('2023-05-16T15:21:16.000Z').subtract(
                        7,
                        'days',
                    ),
                    endDate: moment('2023-05-16T15:21:16.000Z'),
                },
                expectedResult: 'May 9, 2023 - May 16, 2023',
            },
            {
                period: {
                    startDate: moment('2023-05-16T15:21:16.000Z').subtract(
                        7,
                        'days',
                    ),
                    endDate: moment('2023-05-16T15:21:16.000Z'),
                },
                format: DateTimeFormatMapper[
                    DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_GB
                ],
                expectedResult: '9 May, 2023 - 16 May, 2023',
            },
            {
                period: {
                    startDate: moment('2023-05-16T15:21:16.000Z'),
                    endDate: moment('2023-05-16T15:21:16.000Z'),
                },
                expectedResult: 'May 16, 2023',
            },
        ])(
            'should return $expectedResult for $period.startDate and $period.endDate',
            ({ period, format, expectedResult }) => {
                const { startDate, endDate } = period
                const dateFormat =
                    format ??
                    DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
                    ]
                expect(
                    getDateRangePickerLabel(startDate, endDate, dateFormat),
                ).toBe(expectedResult)
            },
        )
    })

    const filtersDraft: SavedFilterDraft = {
        name: 'Copy of Saved Filter',
        filter_group: [
            {
                member: FilterKey.CustomFields,
                values: [
                    {
                        custom_field_id: '5421',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['5421::Handover::With message'],
                    },
                ],
            },
            {
                member: FilterKey.Tags,
                values: [
                    {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['482613', '503339', '458422', '545141'],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            },
            {
                member: FilterKey.Agents,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['296794238'],
            },
        ],
    }

    const savedFilters: AnalyticsFilter = {
        name: 'Copy of Saved Filter',
        filter_group: [
            {
                member: 'customFields',
                values: [
                    {
                        custom_field_id: '5421',
                        operator: 'one-of',
                        values: ['5421::Handover::With message'],
                    },
                ],
            },
            {
                member: 'tags',
                values: [
                    {
                        operator: 'one-of',
                        values: ['482613', '503339', '458422', '545141'],
                    },
                ],
            },
            {
                member: 'agents',
                operator: 'one-of',
                values: ['296794238'],
            },
        ],
        account_id: 18370,
        id: 37,
        created_datetime: '2024-12-03T10:45:51.065322+00:00',
        created_by: 29619422,
        updated_datetime: '2024-12-04T12:23:34.945138+00:00',
        updated_by: 29619422,
        deleted_datetime: null,
    }

    describe('getFormattedFilter', () => {
        it('should format a SavedFilterDraft correctly', () => {
            expect(getFormattedFilter(filtersDraft)).toEqual({
                name: 'Copy of Saved Filter',
                filter_group: [
                    {
                        member: FilterKey.CustomFields,
                        operator: undefined,
                        values: [
                            {
                                operator: LogicalOperatorEnum.ONE_OF,
                                values: ['5421::Handover::With message'],
                                customFieldId: '5421',
                                filterInstanceId: undefined,
                            },
                        ],
                    },
                    {
                        member: FilterKey.Tags,
                        operator: undefined,
                        values: [
                            {
                                operator: LogicalOperatorEnum.ONE_OF,
                                values: [
                                    '482613',
                                    '503339',
                                    '458422',
                                    '545141',
                                ],
                            },
                        ],
                    },
                    {
                        member: FilterKey.Agents,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['296794238'],
                    },
                ],
            })
        })

        it('should return an empty array', () => {
            expect(
                getFormattedFilter({
                    name: 'Copy of Saved Filter',
                    filter_group: null,
                } as any),
            ).toEqual({
                name: 'Copy of Saved Filter',
                filter_group: [],
            })
        })

        it('should format a AnalyticsFilter correctly', () => {
            expect(getFormattedFilter(savedFilters)).toEqual({
                name: 'Copy of Saved Filter',
                filter_group: [
                    {
                        member: 'customFields',
                        operator: undefined,
                        values: [
                            {
                                operator: 'one-of',
                                values: ['5421::Handover::With message'],
                                customFieldId: '5421',
                            },
                        ],
                    },
                    {
                        member: 'tags',
                        operator: undefined,
                        values: [
                            {
                                operator: 'one-of',
                                customFieldId: undefined,
                                values: [
                                    '482613',
                                    '503339',
                                    '458422',
                                    '545141',
                                ],
                            },
                        ],
                    },
                    {
                        member: 'agents',
                        operator: 'one-of',
                        values: ['296794238'],
                    },
                ],
            })
        })
    })

    describe('areFiltersEqual', () => {
        it('should check for equal filters', () => {
            expect(areFiltersEqual(savedFilters, filtersDraft)).toBeTruthy()

            expect(
                areFiltersEqual(
                    { ...savedFilters, name: 'test' },
                    filtersDraft,
                ),
            ).toBeFalsy()

            expect(
                areFiltersEqual(
                    {
                        ...savedFilters,
                        filter_group: [
                            {
                                member: FilterKey.CustomFields,
                                values: [
                                    {
                                        custom_field_id: '1234',
                                        operator: 'one-of',
                                        values: [
                                            '5421::Handover::With message',
                                        ],
                                    },
                                ],
                            },
                            savedFilters.filter_group[1],
                            savedFilters.filter_group[2],
                        ],
                    },
                    filtersDraft,
                ),
            ).toBeFalsy()
        })
    })

    describe('move(array, srcIndex, targetIndex)', () => {
        it('returns an array', () => {
            const actual = move([], 0, 0)

            expect(actual).toBeInstanceOf(Array)
        })

        it('returns a new array', () => {
            const array = [1, 2, 3]
            const actual = move(array, 0, 0)

            expect(actual).not.toBe(array)
        })

        it('moves item from src index to target index', () => {
            const array = [1, 2, 3]
            const actual = move(array, 0, 1)

            expect(actual).toEqual([2, 1, 3])
        })
    })

    describe('getPercent', () => {
        it('should calculate percentage correctly for valid inputs', () => {
            expect(getFormattedPercentage(50, 100)).toBe('50%')
        })

        it('should handle zero total', () => {
            expect(getFormattedPercentage(10, 0)).toBe(
                NOT_AVAILABLE_PLACEHOLDER,
            )
        })

        it('should handle zero value with non-zero total', () => {
            expect(getFormattedPercentage(0, 100)).toBe(
                NOT_AVAILABLE_PLACEHOLDER,
            )
        })
    })

    describe('getDelta', () => {
        it('should format positive changes with a plus sign', () => {
            expect(getFormattedDelta(100, 50)).toBe('+ 100%')
        })

        it('should format negative changes with a minus sign', () => {
            expect(getFormattedDelta(50, 100)).toBe('- 50%')
        })

        it('should handle no change', () => {
            expect(getFormattedDelta(100, 100)).toBe('0%')
        })

        it('should handle single value with default previousValue', () => {
            expect(getFormattedDelta(20)).toBe(UNDEFINED_VARIATION_TEXT)
        })
    })
})
