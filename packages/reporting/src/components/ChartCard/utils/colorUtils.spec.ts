import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import type { ChartDataItem } from '../types'
import {
    assignColorsToData,
    CHART_COLORS,
    TWO_DATA_POINTS_CHART_COLORS,
} from './colorUtils'

describe('colorUtils', () => {
    describe('CHART_COLORS', () => {
        it('should export correct colors', () => {
            expect(CHART_COLORS).toEqual([
                colors['heat-8'].$value,
                colors['heat-6'].$value,
                colors['heat-4'].$value,
                colors['heat-2'].$value,
            ])
        })
    })

    describe('TWO_DATA_POINTS_CHART_COLORS', () => {
        it('should export correct colors for two data points', () => {
            expect(TWO_DATA_POINTS_CHART_COLORS).toEqual([
                colors['Dataviz-purple'].$value,
                colors['Dataviz-orange'].$value,
            ])
        })
    })

    describe('assignColorsToData', () => {
        it('should use TWO_DATA_POINTS_CHART_COLORS when data has exactly 2 items', () => {
            const data: ChartDataItem[] = [
                { name: 'Support', value: 100 },
                { name: 'Shopping assistant', value: 50 },
            ]

            const result = assignColorsToData(data)

            expect(result).toEqual([
                {
                    name: 'Support',
                    value: 100,
                    color: colors['Dataviz-purple'].$value,
                },
                {
                    name: 'Shopping assistant',
                    value: 50,
                    color: colors['Dataviz-orange'].$value,
                },
            ])
        })

        it('should use CHART_COLORS when data has 1 item', () => {
            const data: ChartDataItem[] = [{ name: 'Item 1', value: 100 }]

            const result = assignColorsToData(data)

            expect(result).toEqual([
                {
                    name: 'Item 1',
                    value: 100,
                    color: colors['heat-8'].$value,
                },
            ])
        })

        it('should use CHART_COLORS when data has 3 items', () => {
            const data: ChartDataItem[] = [
                { name: 'Item 1', value: 100 },
                { name: 'Item 2', value: 50 },
                { name: 'Item 3', value: 25 },
            ]

            const result = assignColorsToData(data)

            expect(result).toEqual([
                {
                    name: 'Item 1',
                    value: 100,
                    color: colors['heat-8'].$value,
                },
                {
                    name: 'Item 2',
                    value: 50,
                    color: colors['heat-6'].$value,
                },
                {
                    name: 'Item 3',
                    value: 25,
                    color: colors['heat-4'].$value,
                },
            ])
        })

        it('should use CHART_COLORS when data has more than 4 items', () => {
            const data: ChartDataItem[] = [
                { name: 'Item 1', value: 100 },
                { name: 'Item 2', value: 80 },
                { name: 'Item 3', value: 60 },
                { name: 'Item 4', value: 40 },
                { name: 'Item 5', value: 20 },
            ]

            const result = assignColorsToData(data)

            expect(result).toHaveLength(5)
            expect(result[0].color).toBe(colors['heat-8'].$value)
            expect(result[1].color).toBe(colors['heat-6'].$value)
            expect(result[2].color).toBe(colors['heat-4'].$value)
            expect(result[3].color).toBe(colors['heat-2'].$value)
            // Fifth item cycles back to first color
            expect(result[4].color).toBe(colors['heat-8'].$value)
        })

        it('should handle empty data array', () => {
            const data: ChartDataItem[] = []

            const result = assignColorsToData(data)

            expect(result).toEqual([])
        })

        it('should preserve original data properties', () => {
            const data: ChartDataItem[] = [
                { name: 'Item 1', value: 100 },
                { name: 'Item 2', value: 50 },
            ]

            const result = assignColorsToData(data)

            expect(result[0].name).toBe('Item 1')
            expect(result[0].value).toBe(100)
            expect(result[1].name).toBe('Item 2')
            expect(result[1].value).toBe(50)
        })
    })
})
