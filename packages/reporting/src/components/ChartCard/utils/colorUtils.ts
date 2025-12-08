import type { ChartDataItem } from '../types'

export const CHART_COLORS = [
    '#A084E1',
    '#BDA9EA',
    '#D0C2F0',
    '#E3DAF6',
    '#8B6FD9',
    '#9881E0',
    '#C4B3ED',
    '#F0EBF9',
] as const

export type ChartDataItemWithColor = ChartDataItem & { color: string }

export const assignColorsToData = (
    data: ChartDataItem[],
): ChartDataItemWithColor[] => {
    return data.map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
    }))
}
