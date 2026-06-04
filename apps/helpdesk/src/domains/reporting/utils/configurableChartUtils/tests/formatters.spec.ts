import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    formatPeriod,
    formatTimeSeriesDate,
    toChartData,
    toMultipleTimeSeriesData,
    toTimeSeriesData,
} from 'domains/reporting/utils/configurableChartUtils/formatters'

const buildResult = (
    allValues: { dimension: string; value: number | null }[] | undefined,
    isFetching = false,
): Pick<MetricWithDecile, 'data' | 'isFetching'> => ({
    data:
        allValues === undefined
            ? null
            : {
                  value: null,
                  decile: null,
                  allData: [],
                  allValues: allValues.map((entry) => ({
                      ...entry,
                      decile: null,
                  })),
              },
    isFetching,
})

describe('toChartData', () => {
    it('maps allValues to chart data items using the formatName helper', () => {
        const result = buildResult([
            { dimension: 'email', value: 4.5 },
            { dimension: 'chat', value: 2 },
        ])

        expect(toChartData(result, (value) => value.toUpperCase())).toEqual({
            data: [
                { name: 'EMAIL', value: 4.5 },
                { name: 'CHAT', value: 2 },
            ],
            isLoading: false,
        })
    })

    it('preserves null metric values', () => {
        const result = buildResult([{ dimension: 'email', value: null }])

        expect(toChartData(result, (value) => value)).toEqual({
            data: [{ name: 'email', value: null }],
            isLoading: false,
        })
    })

    it('returns empty data and reflects the fetching state when there is no data', () => {
        expect(
            toChartData(buildResult(undefined, true), (value) => value),
        ).toEqual({
            data: [],
            isLoading: true,
        })
    })
})

describe('formatPeriod', () => {
    it('formats the period start and end dates as short month/day labels', () => {
        const filters = {
            period: {
                start_datetime: '2024-01-01',
                end_datetime: '2024-01-31',
            },
        } as StatsFilters

        expect(formatPeriod(filters)).toEqual({
            start_datetime: 'Jan 1',
            end_datetime: 'Jan 31',
        })
    })
})

const buildSeries = (
    points: { dateTime: string; value: number }[],
): TimeSeriesDataItem[] => points as TimeSeriesDataItem[]

describe('formatTimeSeriesDate', () => {
    it('formats day-granularity dates as short month/day labels', () => {
        expect(
            formatTimeSeriesDate('2024-01-01', ReportingGranularity.Day),
        ).toBe('Jan 1')
    })

    it('formats month-granularity dates as month and year', () => {
        expect(
            formatTimeSeriesDate('2024-01-01', ReportingGranularity.Month),
        ).toBe("Jan'24")
    })

    it('formats hour-granularity dates as short month/day with time', () => {
        expect(
            formatTimeSeriesDate(
                '2024-01-01T13:30:00',
                ReportingGranularity.Hour,
            ),
        ).toBe('Jan 1 at 1:30 pm')
    })

    it('falls back to short month/day labels when granularity is omitted', () => {
        expect(formatTimeSeriesDate('2024-01-01')).toBe('Jan 1')
    })
})

describe('toTimeSeriesData', () => {
    it('maps the first measure series to {date, value} items', () => {
        const result = {
            data: [
                buildSeries([
                    { dateTime: '2024-01-01', value: 4.5 },
                    { dateTime: '2024-01-02', value: 2 },
                ]),
            ],
            isFetching: false,
        }

        expect(toTimeSeriesData(result, ReportingGranularity.Day)).toEqual({
            data: [
                { date: 'Jan 1', value: 4.5 },
                { date: 'Jan 2', value: 2 },
            ],
            isLoading: false,
        })
    })

    it('returns empty data and reflects the fetching state when there is no series', () => {
        expect(
            toTimeSeriesData(
                { data: [], isFetching: true },
                ReportingGranularity.Day,
            ),
        ).toEqual({ data: [], isLoading: true })
    })
})

describe('toMultipleTimeSeriesData', () => {
    it('maps each dimension entry to a labelled series via formatName', () => {
        const result = {
            data: {
                email: [buildSeries([{ dateTime: '2024-01-01', value: 4.5 }])],
                chat: [buildSeries([{ dateTime: '2024-01-01', value: 2 }])],
            },
            isFetching: false,
        }

        expect(
            toMultipleTimeSeriesData(
                result,
                (value) => value.toUpperCase(),
                ReportingGranularity.Day,
            ),
        ).toEqual({
            data: [
                { label: 'EMAIL', values: [{ date: 'Jan 1', value: 4.5 }] },
                { label: 'CHAT', values: [{ date: 'Jan 1', value: 2 }] },
            ],
            isLoading: false,
        })
    })

    it('filters out series whose values are all zero or null', () => {
        const result = {
            data: {
                email: [buildSeries([{ dateTime: '2024-01-01', value: 0 }])],
                chat: [buildSeries([{ dateTime: '2024-01-01', value: 3 }])],
            },
            isFetching: false,
        }

        expect(
            toMultipleTimeSeriesData(
                result,
                (value) => value,
                ReportingGranularity.Day,
            ).data,
        ).toEqual([{ label: 'chat', values: [{ date: 'Jan 1', value: 3 }] }])
    })

    it('returns empty data and reflects the fetching state when there is no data', () => {
        expect(
            toMultipleTimeSeriesData(
                { data: undefined, isFetching: true },
                (value) => value,
            ),
        ).toEqual({ data: [], isLoading: true })
    })
})
