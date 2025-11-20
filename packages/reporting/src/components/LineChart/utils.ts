import type { TwoDimensionalDataItem } from '../../types'

export const toChartData = (data: TwoDimensionalDataItem[]) => {
    const pointsMap = new Map<string, Record<string, string | number>>()

    for (const series of data) {
        for (const point of series.values) {
            const key = point.x
            if (!pointsMap.has(key)) {
                pointsMap.set(key, { name: key })
            }
            const existingPoint = pointsMap.get(key)!
            existingPoint[series.label] = point.y
        }
    }

    return Array.from(pointsMap.values())
}
