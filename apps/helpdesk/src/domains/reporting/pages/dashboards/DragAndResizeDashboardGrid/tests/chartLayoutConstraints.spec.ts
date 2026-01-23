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
                default: { width: 1, height: 3 },
                min: { width: 1, height: 3 },
                max: { width: 2, height: 5 },
            })
        })

        it('returns correct constraints for Graph chart type', () => {
            const constraints = getChartConstraints(ChartType.Graph)

            expect(constraints).toEqual({
                default: { width: 2, height: 9 },
                min: { width: 1, height: 6 },
                max: { width: 4, height: 12 },
            })
        })

        it('returns correct constraints for Table chart type', () => {
            const constraints = getChartConstraints(ChartType.Table)

            expect(constraints).toEqual({
                default: { width: 4, height: 22 },
                min: { width: 2, height: 12 },
                max: { width: 4, height: 24 },
            })
        })
    })

    describe('getMaxChartHeight', () => {
        it('returns the maximum height across all chart types', () => {
            const maxHeight = getMaxChartHeight()

            expect(maxHeight).toBe(24)
        })
    })
})
