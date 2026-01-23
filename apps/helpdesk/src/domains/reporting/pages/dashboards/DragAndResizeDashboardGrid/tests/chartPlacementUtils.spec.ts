import type { ChartLayoutConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import { calculateChartPositions } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartPlacementUtils'

describe('chartPlacementUtils', () => {
    describe('calculateChartPositions', () => {
        it('places single chart at origin', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 2, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([{ x: 0, y: 0, w: 2, h: 2 }])
        })

        it('places two charts side by side when they fit', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 2, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 2, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 2, h: 2 },
                { x: 2, y: 0, w: 2, h: 2 },
            ])
        })

        it('moves chart to next row when it does not fit horizontally', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 3, h: 2 },
                { x: 0, y: 2, w: 3, h: 2 },
            ])
        })

        it('fills gaps with smaller charts', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 1, height: 1 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 3, h: 2 },
                { x: 3, y: 0, w: 1, h: 1 },
            ])
        })

        it('handles full-width charts', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 4, height: 3 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 2, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 4, h: 3 },
                { x: 0, y: 3, w: 2, h: 2 },
            ])
        })

        it('handles complex mixed-size layout', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 1, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 1, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 1, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 1, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 4, height: 3 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 1, h: 2 },
                { x: 1, y: 0, w: 1, h: 2 },
                { x: 2, y: 0, w: 1, h: 2 },
                { x: 3, y: 0, w: 1, h: 2 },
                { x: 0, y: 2, w: 4, h: 3 },
            ])
        })

        it('avoids overlaps with different height charts', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 2, height: 3 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 2, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
                {
                    default: { width: 2, height: 1 },
                    min: { width: 1, height: 1 },
                    max: { width: 4, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 2, h: 3 },
                { x: 2, y: 0, w: 2, h: 2 },
                { x: 2, y: 2, w: 2, h: 1 },
            ])
        })

        it('handles edge case when chart width exceeds grid columns', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 5, height: 2 },
                    min: { width: 5, height: 2 },
                    max: { width: 5, height: 2 },
                },
            ]

            const positions = calculateChartPositions(constraints, 4)

            expect(positions).toEqual([{ x: 0, y: 480, w: 5, h: 2 }])
        })
    })
})
