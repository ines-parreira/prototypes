import { MAX_CHECKED_CHARTS } from 'domains/reporting/pages/dashboards/config'
import { getMaxChartHeight } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'
import type { ChartLayoutConstraints } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/chartLayoutConstraints'

export type GridPosition = {
    x: number
    y: number
    w: number
    h: number
}

export type OccupiedGrid = Set<string>

const getCellKey = (x: number, y: number): string => `${x},${y}`

const isPositionAvailable = (
    grid: OccupiedGrid,
    x: number,
    y: number,
    width: number,
    height: number,
    cols: number,
): boolean => {
    if (x + width > cols) {
        return false
    }

    for (let row = y; row < y + height; row++) {
        for (let col = x; col < x + width; col++) {
            if (grid.has(getCellKey(col, row))) {
                return false
            }
        }
    }

    return true
}

const markPositionOccupied = (
    grid: OccupiedGrid,
    x: number,
    y: number,
    width: number,
    height: number,
): void => {
    for (let row = y; row < y + height; row++) {
        for (let col = x; col < x + width; col++) {
            grid.add(getCellKey(col, row))
        }
    }
}

const MAX_ROWS_TO_SEARCH = MAX_CHECKED_CHARTS * getMaxChartHeight()

const findNextAvailablePosition = (
    grid: OccupiedGrid,
    width: number,
    height: number,
    cols: number,
): { x: number; y: number } => {
    let row = 0
    let maxRowsSearched = 0

    while (maxRowsSearched < MAX_ROWS_TO_SEARCH) {
        for (let col = 0; col < cols; col++) {
            if (isPositionAvailable(grid, col, row, width, height, cols)) {
                return { x: col, y: row }
            }
        }
        row++
        maxRowsSearched++
    }

    return { x: 0, y: row }
}

export const calculateChartPositions = (
    chartConstraints: ChartLayoutConstraints[],
    cols: number,
): GridPosition[] => {
    const occupiedGrid: OccupiedGrid = new Set()
    const positions: GridPosition[] = []

    chartConstraints.forEach((constraints) => {
        const width = constraints.default.width
        const height = constraints.default.height

        const { x, y } = findNextAvailablePosition(
            occupiedGrid,
            width,
            height,
            cols,
        )

        markPositionOccupied(occupiedGrid, x, y, width, height)

        positions.push({ x, y, w: width, h: height })
    })

    return positions
}

export const calculateChartPositionsWithOccupied = (
    chartConstraints: ChartLayoutConstraints[],
    cols: number,
    occupiedGrid: OccupiedGrid,
): GridPosition[] => {
    const positions: GridPosition[] = []

    chartConstraints.forEach((constraints) => {
        const width = constraints.default.width
        const height = constraints.default.height

        const { x, y } = findNextAvailablePosition(
            occupiedGrid,
            width,
            height,
            cols,
        )

        markPositionOccupied(occupiedGrid, x, y, width, height)

        positions.push({ x, y, w: width, h: height })
    })

    return positions
}
