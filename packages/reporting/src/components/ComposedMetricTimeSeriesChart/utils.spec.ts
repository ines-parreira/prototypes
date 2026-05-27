import { describe, expect, it } from 'vitest'

import { NOT_AVAILABLE_PLACEHOLDER } from '../../constants'

import type {
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMarker,
} from './types'
import {
    formatMetricValue,
    formatXAxisValue,
    getActiveMarkers,
    getHorizontalGridValues,
    getMarkerPoints,
    getMetricValue,
    getNumericAxisTicks,
    getTooltipDate,
    getTooltipMetricValue,
    resolveResponsiveContainerWidth,
    sampleXAxisTickValues,
} from './utils'

const buildData = (
    items: ComposedMetricTimeSeriesDataItem[],
): ComposedMetricTimeSeriesDataItem[] => items

describe('getMetricValue', () => {
    it('returns the numeric value for a known data key', () => {
        expect(
            getMetricValue(
                { ticketVolume: 12, handoverRate: 50 },
                'ticketVolume',
            ),
        ).toBe(12)
    })

    it('returns null when the value is missing', () => {
        expect(getMetricValue({ ticketVolume: 12 }, 'handoverRate')).toBeNull()
    })

    it('returns null when the value is not a number', () => {
        expect(
            getMetricValue(
                { ticketVolume: '12' as unknown as number },
                'ticketVolume',
            ),
        ).toBeNull()
        expect(
            getMetricValue({ ticketVolume: null }, 'ticketVolume'),
        ).toBeNull()
    })
})

describe('getTooltipMetricValue', () => {
    const data: ComposedMetricTimeSeriesDataItem = {
        ticketVolume: 10,
        handoverRate: null,
    }

    it('prefers a numeric value from the recharts payload', () => {
        expect(
            getTooltipMetricValue(
                [{ dataKey: 'ticketVolume', value: 25 }],
                data,
                'ticketVolume',
            ),
        ).toBe(25)
    })

    it('falls back to the data record when the payload entry is missing', () => {
        expect(getTooltipMetricValue([], data, 'ticketVolume')).toBe(10)
    })

    it('returns null when neither payload nor data has a numeric value', () => {
        expect(
            getTooltipMetricValue(
                [{ dataKey: 'handoverRate', value: null }],
                data,
                'handoverRate',
            ),
        ).toBeNull()
    })
})

describe('formatMetricValue', () => {
    it('returns the not-available placeholder when value is null', () => {
        expect(formatMetricValue(null)).toBe(NOT_AVAILABLE_PLACEHOLDER)
    })

    it('stringifies the value when no formatter is provided', () => {
        expect(formatMetricValue(42)).toBe('42')
    })

    it('uses the provided formatter when present', () => {
        expect(formatMetricValue(50, (value) => `${value}%`)).toBe('50%')
    })
})

describe('getTooltipDate', () => {
    it('returns the string representation of the date field', () => {
        expect(getTooltipDate({ date: '2026-04-20' }, 'date')).toBe(
            '2026-04-20',
        )
    })

    it('returns an empty string when the field is missing', () => {
        expect(getTooltipDate({}, 'date')).toBe('')
    })
})

describe('getActiveMarkers', () => {
    const markers: ComposedMetricTimeSeriesMarker[] = [
        { id: 'a', date: '2026-04-20', label: 'A' },
        { id: 'b', date: '2026-04-21', label: 'B' },
        { id: 'c', date: '2026-04-21', label: 'C' },
    ]

    it('returns markers whose date matches', () => {
        expect(getActiveMarkers(markers, '2026-04-21')).toEqual([
            markers[1],
            markers[2],
        ])
    })

    it('returns an empty array when no markers match', () => {
        expect(getActiveMarkers(markers, '2026-05-01')).toEqual([])
    })

    it('defaults to an empty marker list', () => {
        expect(getActiveMarkers(undefined, '2026-04-21')).toEqual([])
    })
})

describe('getMarkerPoints', () => {
    const data = buildData([
        { date: '2026-04-20', handoverRate: 50 },
        { date: '2026-04-21', handoverRate: null },
        { date: '2026-04-22', handoverRate: 75 },
    ])

    it('attaches the line metric value to each marker that lines up with a data point', () => {
        const markers: ComposedMetricTimeSeriesMarker[] = [
            { id: 'm1', date: '2026-04-20', label: 'A' },
            { id: 'm2', date: '2026-04-22', label: 'B' },
        ]

        expect(getMarkerPoints(data, markers, 'date', 'handoverRate')).toEqual([
            { id: 'm1', date: '2026-04-20', label: 'A', value: 50 },
            { id: 'm2', date: '2026-04-22', label: 'B', value: 75 },
        ])
    })

    it('drops markers when the matching data point has no line metric value', () => {
        const markers: ComposedMetricTimeSeriesMarker[] = [
            { id: 'm1', date: '2026-04-21', label: 'A' },
        ]

        expect(getMarkerPoints(data, markers, 'date', 'handoverRate')).toEqual(
            [],
        )
    })

    it('drops markers that have no matching date in the data', () => {
        const markers: ComposedMetricTimeSeriesMarker[] = [
            { id: 'm1', date: '2026-05-01', label: 'A' },
        ]

        expect(getMarkerPoints(data, markers, 'date', 'handoverRate')).toEqual(
            [],
        )
    })
})

describe('resolveResponsiveContainerWidth', () => {
    it('returns a numeric width unchanged', () => {
        expect(resolveResponsiveContainerWidth(640)).toBe(640)
    })

    it('returns a percentage string unchanged', () => {
        expect(resolveResponsiveContainerWidth('75%')).toBe('75%')
    })

    it('falls back to 100% for unsupported values', () => {
        expect(resolveResponsiveContainerWidth(undefined)).toBe('100%')
        expect(
            resolveResponsiveContainerWidth('500px' as unknown as `${number}%`),
        ).toBe('100%')
    })
})

describe('getNumericAxisTicks', () => {
    it('returns undefined when no domain is provided', () => {
        expect(getNumericAxisTicks(undefined)).toBeUndefined()
    })

    it('returns undefined when either bound is not finite', () => {
        expect(
            getNumericAxisTicks([Number.NaN as unknown as number, 100]),
        ).toBeUndefined()
        expect(
            getNumericAxisTicks([
                0,
                Number.POSITIVE_INFINITY as unknown as number,
            ]),
        ).toBeUndefined()
    })

    it('returns undefined when either bound is non-numeric', () => {
        expect(getNumericAxisTicks(['0', 100])).toBeUndefined()
    })

    it('returns a single tick when min equals max', () => {
        expect(getNumericAxisTicks([5, 5])).toEqual([5])
    })

    it('produces six evenly-spaced ticks across the domain', () => {
        expect(getNumericAxisTicks([0, 100])).toEqual([0, 20, 40, 60, 80, 100])
    })

    it('rounds ticks to six decimal places to avoid floating-point drift', () => {
        const ticks = getNumericAxisTicks([0, 1]) ?? []

        expect(ticks).toHaveLength(6)
        ticks.forEach((tick) => {
            const decimals = String(tick).split('.')[1] ?? ''
            expect(decimals.length).toBeLessThanOrEqual(6)
        })
    })
})

describe('getHorizontalGridValues', () => {
    it('returns undefined when ticks are undefined', () => {
        expect(getHorizontalGridValues(undefined)).toBeUndefined()
    })

    it('returns the input when there is at most one tick', () => {
        expect(getHorizontalGridValues([5])).toEqual([5])
    })

    it('drops the first tick so the baseline is not double-drawn', () => {
        expect(getHorizontalGridValues([0, 20, 40, 60, 80, 100])).toEqual([
            20, 40, 60, 80, 100,
        ])
    })
})

describe('formatXAxisValue', () => {
    it('stringifies the value when no formatter is provided', () => {
        expect(formatXAxisValue('2026-04-20')).toBe('2026-04-20')
        expect(formatXAxisValue(42)).toBe('42')
    })

    it('uses the provided formatter when present', () => {
        expect(formatXAxisValue('2026-04-20', (date) => date.slice(5))).toBe(
            '04-20',
        )
    })
})

describe('sampleXAxisTickValues', () => {
    const buildDailyData = (count: number) =>
        Array.from({ length: count }, (_, index) => {
            const day = String(index + 1).padStart(2, '0')

            return { date: `2026-04-${day}` }
        })

    it('returns an empty array when data is empty', () => {
        expect(sampleXAxisTickValues([], 'date', 600)).toEqual([])
    })

    it('returns all values when the count fits the available width', () => {
        expect(sampleXAxisTickValues(buildDailyData(5), 'date', 1200)).toEqual([
            '2026-04-01',
            '2026-04-02',
            '2026-04-03',
            '2026-04-04',
            '2026-04-05',
        ])
    })

    it('always keeps the first and last labels when sampling', () => {
        const result = sampleXAxisTickValues(
            buildDailyData(28),
            'date',
            600,
            (date) => date.slice(5),
        )

        expect(result[0]).toBe('2026-04-01')
        expect(result[result.length - 1]).toBe('2026-04-28')
        expect(result.length).toBeLessThan(28)
    })

    it('falls back to a default label count when width is unknown', () => {
        const result = sampleXAxisTickValues(buildDailyData(28), 'date')

        expect(result).toHaveLength(7)
        expect(result[0]).toBe('2026-04-01')
        expect(result[result.length - 1]).toBe('2026-04-28')
    })

    it('keeps only the first value when the available width forces a single label', () => {
        expect(
            sampleXAxisTickValues(buildDailyData(28), 'date', 80, (date) =>
                date.slice(5),
            ),
        ).toEqual(['2026-04-01'])
    })

    it('skips records whose date field is missing or non-scalar', () => {
        const data = [
            { date: '2026-04-01' },
            { date: undefined },
            { date: { nested: true } as unknown as string },
            { date: '2026-04-02' },
        ]

        expect(sampleXAxisTickValues(data, 'date', 1200)).toEqual([
            '2026-04-01',
            '2026-04-02',
        ])
    })
})
