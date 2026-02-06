import type { ChartLayoutConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import { clampLayoutToConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/layoutUtils'
import type { ChartLayoutMetadata } from 'domains/reporting/pages/dashboards/types'

describe('layoutUtils', () => {
    describe('clampLayoutToConstraints', () => {
        const mockConstraints: ChartLayoutConstraints = {
            default: { width: 6, height: 20 },
            min: { width: 3, height: 6 },
            max: { width: 12, height: 24 },
        }

        const gridCols = 12

        it('returns layout unchanged when within constraints', () => {
            const layout: ChartLayoutMetadata = { x: 3, y: 5, w: 6, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result).toEqual({ x: 3, y: 5, w: 6, h: 12 })
        })

        it('clamps negative x position to 0', () => {
            const layout: ChartLayoutMetadata = { x: -5, y: 5, w: 6, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.x).toBe(0)
        })

        it('clamps negative y position to 0', () => {
            const layout: ChartLayoutMetadata = { x: 3, y: -10, w: 6, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.y).toBe(0)
        })

        it('clamps x position when chart would overflow grid', () => {
            const layout: ChartLayoutMetadata = { x: 11, y: 5, w: 3, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.x).toBe(9)
        })

        it('clamps width below minimum to minimum', () => {
            const layout: ChartLayoutMetadata = { x: 0, y: 0, w: 1, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.w).toBe(3)
        })

        it('clamps width above maximum to maximum', () => {
            const layout: ChartLayoutMetadata = { x: 0, y: 0, w: 15, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.w).toBe(12)
        })

        it('clamps height below minimum to minimum', () => {
            const layout: ChartLayoutMetadata = { x: 0, y: 0, w: 6, h: 2 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.h).toBe(6)
        })

        it('clamps height above maximum to maximum', () => {
            const layout: ChartLayoutMetadata = { x: 0, y: 0, w: 6, h: 100 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result.h).toBe(24)
        })

        it('clamps multiple violations at once', () => {
            const layout: ChartLayoutMetadata = {
                x: -5,
                y: -10,
                w: 100,
                h: 1,
            }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result).toEqual({ x: 0, y: 0, w: 12, h: 6 })
        })

        it('handles edge case at grid boundary', () => {
            const layout: ChartLayoutMetadata = { x: 9, y: 0, w: 3, h: 12 }

            const result = clampLayoutToConstraints(
                layout,
                mockConstraints,
                gridCols,
            )

            expect(result).toEqual({ x: 9, y: 0, w: 3, h: 12 })
            expect(result.x + result.w).toBe(12)
        })

        it('works with different grid column counts', () => {
            const layout: ChartLayoutMetadata = { x: 3, y: 0, w: 6, h: 12 }

            const result = clampLayoutToConstraints(layout, mockConstraints, 8)

            expect(result.x).toBe(3)
        })

        it('adjusts x when grid columns reduce', () => {
            const layout: ChartLayoutMetadata = { x: 10, y: 0, w: 3, h: 12 }

            const result = clampLayoutToConstraints(layout, mockConstraints, 8)

            expect(result.x).toBe(5)
        })
    })
})
