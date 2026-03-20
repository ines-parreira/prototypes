import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import {
    buildBarCsvFiles,
    buildMultipleTimeSeriesCsvFiles,
    buildTimeSeriesCsvFiles,
    toSlug,
    useConfigurableGraphsReportData,
} from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import type { Period } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

const defaultPeriod: Period = {
    start_datetime: '2024-01-01T00:00:00.000Z',
    end_datetime: '2024-01-31T23:59:59.999Z',
}

const defaultStatsFilters = {
    period: defaultPeriod,
}

describe('toSlug', () => {
    it('converts a name to lowercase with hyphens', () => {
        expect(toSlug('Hello World')).toBe('hello-world')
    })

    it('strips trailing hyphens from non-alphanumeric endings', () => {
        expect(toSlug('Tickets Created!')).toBe('tickets-created')
    })

    it('strips leading hyphens from non-alphanumeric beginnings', () => {
        expect(toSlug('!Hello')).toBe('hello')
    })

    it('handles already-lowercase slugs', () => {
        expect(toSlug('already-slug')).toBe('already-slug')
    })
})

describe('useConfigurableGraphs', () => {
    it('returns merged files from all fetch results', async () => {
        const fetchA = jest
            .fn()
            .mockResolvedValue({ files: { 'a.csv': 'dataA' } })
        const fetchB = jest
            .fn()
            .mockResolvedValue({ files: { 'b.csv': 'dataB' } })

        const { result } = renderHook(() =>
            useConfigurableGraphsReportData(
                defaultStatsFilters as any,
                'UTC',
                ReportingGranularity.Day,
                [
                    {
                        fetch: fetchA,
                        savedMeasure: 'measure1',
                        savedDimension: null,
                        chartId: 'chart1',
                    },
                    {
                        fetch: fetchB,
                        savedMeasure: 'measure2',
                        savedDimension: null,
                        chartId: 'chart2',
                    },
                ],
            ),
        )

        expect(result.current.isFetching).toBe(true)

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                files: { 'a.csv': 'dataA', 'b.csv': 'dataB' },
            })
        })
    })

    it('resolves immediately with empty files when no graphs are configured', async () => {
        const { result } = renderHook(() =>
            useConfigurableGraphsReportData(
                defaultStatsFilters as any,
                'UTC',
                ReportingGranularity.Day,
                [],
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({ isFetching: false, files: {} })
        })
    })

    it('returns empty files on fetch failure', async () => {
        const fetchFailing = jest
            .fn()
            .mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() =>
            useConfigurableGraphsReportData(
                defaultStatsFilters as any,
                'UTC',
                ReportingGranularity.Day,
                [
                    {
                        fetch: fetchFailing,
                        savedMeasure: null,
                        savedDimension: null,
                        chartId: 'chart1',
                    },
                ],
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({ isFetching: false, files: {} })
        })
    })

    it('passes correct arguments to each fetch function', async () => {
        const fetchA = jest.fn().mockResolvedValue({ files: {} })

        renderHook(() =>
            useConfigurableGraphsReportData(
                defaultStatsFilters as any,
                'America/New_York',
                ReportingGranularity.Week,
                [
                    {
                        fetch: fetchA,
                        savedMeasure: 'myMeasure',
                        savedDimension: 'myDimension',
                        chartId: 'chart1',
                    },
                ],
            ),
        )

        await waitFor(() => {
            expect(fetchA).toHaveBeenCalledWith(
                'myMeasure',
                'myDimension',
                defaultStatsFilters,
                'America/New_York',
                ReportingGranularity.Week,
            )
        })
    })
})

describe('buildBarCsvFiles', () => {
    it('returns empty object when data is empty', () => {
        const result = buildBarCsvFiles(
            [],
            'Metric',
            'Dimension',
            'decimal',
            defaultPeriod,
        )
        expect(result).toEqual({})
    })

    it('builds a CSV with header and data rows', () => {
        const data = [
            { name: 'Category A', value: 42 },
            { name: 'Category B', value: null },
        ]
        const result = buildBarCsvFiles(
            data,
            'Count',
            'Label',
            'decimal',
            defaultPeriod,
        )

        const csvContent = Object.values(result)[0]
        expect(csvContent).toContain('"Label","Count"')
        expect(csvContent).toContain('"Category A"')
        expect(csvContent).toContain('"Category B"')
    })

    it('uses the metric name slug in the file name', () => {
        const data = [{ name: 'A', value: 1 }]
        const result = buildBarCsvFiles(
            data,
            'My Metric',
            'Label',
            'decimal',
            defaultPeriod,
        )
        const fileName = Object.keys(result)[0]
        expect(fileName).toContain('my-metric')
        expect(fileName).toMatch(/\.csv$/)
    })
})

describe('buildTimeSeriesCsvFiles', () => {
    it('returns empty object when data is empty', () => {
        const result = buildTimeSeriesCsvFiles(
            [],
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(result).toEqual({})
    })

    it('builds a CSV with Date header and time series rows', () => {
        const data = [
            { date: '2024-01-01', value: 10 },
            { date: '2024-01-02', value: 20 },
        ]
        const result = buildTimeSeriesCsvFiles(
            data,
            'Tickets Created',
            'decimal',
            defaultPeriod,
        )

        const csvContent = Object.values(result)[0]
        expect(csvContent).toContain('"Date","Tickets Created"')
        expect(csvContent).toContain('"2024-01-01"')
        expect(csvContent).toContain('"2024-01-02"')
    })

    it('includes timeseries suffix in the file name', () => {
        const data = [{ date: '2024-01-01', value: 5 }]
        const result = buildTimeSeriesCsvFiles(
            data,
            'My Metric',
            'decimal',
            defaultPeriod,
        )
        const fileName = Object.keys(result)[0]
        expect(fileName).toContain('my-metric-timeseries')
        expect(fileName).toMatch(/\.csv$/)
    })

    it('returns empty object when all values are 0', () => {
        const data = [
            { date: '2024-01-01', value: 0 },
            { date: '2024-01-02', value: 0 },
        ]
        const result = buildTimeSeriesCsvFiles(
            data,
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(result).toEqual({})
    })

    it('returns CSV when at least one value is non-zero', () => {
        const data = [
            { date: '2024-01-01', value: 0 },
            { date: '2024-01-02', value: 5 },
            { date: '2024-01-02', value: 0 },
            { date: '2024-01-02', value: 0 },
        ]
        const result = buildTimeSeriesCsvFiles(
            data,
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(Object.keys(result)).toHaveLength(1)
    })
})

describe('buildMultipleTimeSeriesCsvFiles', () => {
    it('returns empty object when data is empty', () => {
        const result = buildMultipleTimeSeriesCsvFiles(
            [],
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(result).toEqual({})
    })

    it('returns empty object when the first series has no values', () => {
        const data = [{ label: 'Series A', values: [] }]
        const result = buildMultipleTimeSeriesCsvFiles(
            data,
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(result).toEqual({})
    })

    it('builds a CSV with Date and series labels as headers', () => {
        const data = [
            {
                label: 'Series A',
                values: [
                    { date: '2024-01-01', value: 10 },
                    { date: '2024-01-02', value: 20 },
                ],
            },
            {
                label: 'Series B',
                values: [
                    { date: '2024-01-01', value: 5 },
                    { date: '2024-01-02', value: 15 },
                ],
            },
        ]

        const result = buildMultipleTimeSeriesCsvFiles(
            data,
            'Automation Rate',
            'decimal',
            defaultPeriod,
        )

        const csvContent = Object.values(result)[0]
        expect(csvContent).toContain('"Date","Series A","Series B"')
        expect(csvContent).toContain('"2024-01-01"')
        expect(csvContent).toContain('"2024-01-02"')
    })

    it('includes timeseries suffix in the file name', () => {
        const data = [
            {
                label: 'Series A',
                values: [{ date: '2024-01-01', value: 1 }],
            },
        ]
        const result = buildMultipleTimeSeriesCsvFiles(
            data,
            'Automation Rate',
            'decimal',
            defaultPeriod,
        )
        const fileName = Object.keys(result)[0]
        expect(fileName).toContain('automation-rate-timeseries')
        expect(fileName).toMatch(/\.csv$/)
    })

    it('handles null values in series', () => {
        const data = [
            {
                label: 'Series A',
                values: [{ date: '2024-01-01', value: null }],
            },
        ]

        const result = buildMultipleTimeSeriesCsvFiles(
            data,
            'Metric',
            'decimal',
            defaultPeriod,
        )
        const csvContent = Object.values(result)[0]
        expect(csvContent).toBeTruthy()
    })

    it('returns empty object when all values across all series are 0', () => {
        const data = [
            {
                label: 'Series A',
                values: [
                    { date: '2024-01-01', value: 0 },
                    { date: '2024-01-02', value: 0 },
                ],
            },
            {
                label: 'Series B',
                values: [
                    { date: '2024-01-01', value: 0 },
                    { date: '2024-01-02', value: 0 },
                ],
            },
        ]

        const result = buildMultipleTimeSeriesCsvFiles(
            data,
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(result).toEqual({})
    })

    it('returns CSV when at least one series has a non-zero value', () => {
        const data = [
            {
                label: 'Series A',
                values: [
                    { date: '2024-01-01', value: 0 },
                    { date: '2024-01-02', value: 5 },
                ],
            },
            {
                label: 'Series B',
                values: [
                    { date: '2024-01-01', value: 0 },
                    { date: '2024-01-02', value: 0 },
                ],
            },
        ]

        const result = buildMultipleTimeSeriesCsvFiles(
            data,
            'Metric',
            'decimal',
            defaultPeriod,
        )
        expect(Object.keys(result)).toHaveLength(1)
    })
})
