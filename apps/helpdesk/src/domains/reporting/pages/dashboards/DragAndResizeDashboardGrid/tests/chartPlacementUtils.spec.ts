import type { ChartLayoutConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import {
    calculateChartPositions,
    calculateChartPositionsWithOccupied,
} from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartPlacementUtils'

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

            const positions = calculateChartPositions(constraints, 12)

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

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 2, h: 2 },
                { x: 2, y: 0, w: 2, h: 2 },
            ])
        })

        it('moves chart to next row when it does not fit horizontally', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 8, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 8, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 8, h: 2 },
                { x: 0, y: 2, w: 8, h: 2 },
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

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 3, h: 2 },
                { x: 3, y: 0, w: 1, h: 1 },
            ])
        })

        it('handles full-width charts', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 12, height: 3 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 6, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 12, h: 3 },
                { x: 0, y: 3, w: 6, h: 2 },
            ])
        })

        it('handles complex mixed-size layout', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 3, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 12, height: 3 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 3, h: 2 },
                { x: 3, y: 0, w: 3, h: 2 },
                { x: 6, y: 0, w: 3, h: 2 },
                { x: 9, y: 0, w: 3, h: 2 },
                { x: 0, y: 2, w: 12, h: 3 },
            ])
        })

        it('avoids overlaps with different height charts', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 6, height: 3 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 6, height: 2 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
                {
                    default: { width: 6, height: 1 },
                    min: { width: 1, height: 1 },
                    max: { width: 12, height: 4 },
                },
            ]

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([
                { x: 0, y: 0, w: 6, h: 3 },
                { x: 6, y: 0, w: 6, h: 2 },
                { x: 6, y: 2, w: 6, h: 1 },
            ])
        })

        it('handles edge case when chart width exceeds grid columns', () => {
            const constraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 15, height: 2 },
                    min: { width: 15, height: 2 },
                    max: { width: 15, height: 2 },
                },
            ]

            const positions = calculateChartPositions(constraints, 12)

            expect(positions).toEqual([{ x: 0, y: 960, w: 15, h: 2 }])
        })
    })

    describe('calculateChartPositionsWithOccupied', () => {
        it('should calculate positions for new charts avoiding occupied cells', () => {
            const occupiedGrid = new Set<string>()
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 2; col++) {
                    occupiedGrid.add(`${col},${row}`)
                }
            }

            const newChartConstraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 2, height: 9 },
                    min: { width: 1, height: 6 },
                    max: { width: 4, height: 12 },
                },
            ]

            const positions = calculateChartPositionsWithOccupied(
                newChartConstraints,
                12,
                occupiedGrid,
            )

            expect(positions).toEqual([{ x: 2, y: 0, w: 2, h: 9 }])
        })

        it('should place new charts on next row when current row is full', () => {
            const occupiedGrid = new Set<string>()
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 12; col++) {
                    occupiedGrid.add(`${col},${row}`)
                }
            }

            const newChartConstraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 2, height: 9 },
                    min: { width: 1, height: 6 },
                    max: { width: 4, height: 12 },
                },
            ]

            const positions = calculateChartPositionsWithOccupied(
                newChartConstraints,
                12,
                occupiedGrid,
            )

            expect(positions).toEqual([{ x: 0, y: 9, w: 2, h: 9 }])
        })

        it('should prevent overlaps between multiple new charts', () => {
            const occupiedGrid = new Set<string>()

            const newChartConstraints: ChartLayoutConstraints[] = [
                {
                    default: { width: 2, height: 9 },
                    min: { width: 1, height: 6 },
                    max: { width: 4, height: 12 },
                },
                {
                    default: { width: 2, height: 9 },
                    min: { width: 1, height: 6 },
                    max: { width: 4, height: 12 },
                },
            ]

            const positions = calculateChartPositionsWithOccupied(
                newChartConstraints,
                12,
                occupiedGrid,
            )

            expect(positions).toEqual([
                { x: 0, y: 0, w: 2, h: 9 },
                { x: 2, y: 0, w: 2, h: 9 },
            ])
        })
    })
})
