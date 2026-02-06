import type { ChartLayoutConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import type { ChartLayoutMetadata } from 'domains/reporting/pages/dashboards/types'

/**
 * @description Clamps a chart layout to ensure it respects grid constraints.
 *
 * Ensures:
 * - Position (x, y) is non-negative and fits within grid
 * - Size (w, h) respects min/max constraints
 *
 * @param layout - The layout to clamp
 * @param constraints - The constraints to enforce
 * @param gridCols - Total number of columns in the grid
 * @returns Clamped layout that respects all constraints
 */
export const clampLayoutToConstraints = (
    layout: ChartLayoutMetadata,
    constraints: ChartLayoutConstraints,
    gridCols: number,
): ChartLayoutMetadata => {
    return {
        x: Math.max(0, Math.min(layout.x, gridCols - constraints.min.width)),
        y: Math.max(0, layout.y),
        w: Math.max(
            constraints.min.width,
            Math.min(layout.w, constraints.max.width),
        ),
        h: Math.max(
            constraints.min.height,
            Math.min(layout.h, constraints.max.height),
        ),
    }
}
