import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatPeriod,
    toChartData,
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
