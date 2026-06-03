import {
    getChartConstraints,
    getMaxChartHeight,
} from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import { ChartType } from 'domains/reporting/pages/dashboards/types'

describe('chartLayoutConstraints', () => {
    describe('getChartConstraints', () => {
        it('returns correct constraints for Card chart type', () => {
            const constraints = getChartConstraints(ChartType.Card)

            expect(constraints).toEqual({
                default: { width: 3, height: 4 },
                min: { width: 3, height: 4 },
                max: { width: 6, height: 16 },
            })
        })

        it('returns correct constraints for Graph chart type', () => {
            const constraints = getChartConstraints(ChartType.Graph)

            expect(constraints).toEqual({
                default: { width: 6, height: 14 },
                min: { width: 3, height: 8 },
                max: { width: 12, height: 24 },
            })
        })

        it('returns correct constraints for Table chart type', () => {
            const constraints = getChartConstraints(ChartType.Table)

            expect(constraints).toEqual({
                default: { width: 12, height: 22 },
                min: { width: 6, height: 14 },
                max: { width: 12, height: 48 },
            })
        })

        it('adds 1 to all heights when showMetricOrigin is true', () => {
            expect(getChartConstraints(ChartType.Card, true)).toEqual({
                default: { width: 3, height: 5 },
                min: { width: 3, height: 5 },
                max: { width: 6, height: 17 },
            })
            expect(getChartConstraints(ChartType.Graph, true)).toEqual({
                default: { width: 6, height: 15 },
                min: { width: 3, height: 9 },
                max: { width: 12, height: 25 },
            })
            expect(getChartConstraints(ChartType.Table, true)).toEqual({
                default: { width: 12, height: 23 },
                min: { width: 6, height: 15 },
                max: { width: 12, height: 49 },
            })
        })
    })

    describe('getMaxChartHeight', () => {
        it('returns the maximum height across all chart types including path offset', () => {
            const maxHeight = getMaxChartHeight()

            expect(maxHeight).toBe(49)
        })
    })
})
