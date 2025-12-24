import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import type { ChartDataItem } from '../types'

export const CHART_COLORS = [
    colors['heat-8'].$value,
    colors['heat-6'].$value,
    colors['heat-4'].$value,
    colors['heat-2'].$value,
] as const

export const TWO_DATA_POINTS_CHART_COLORS = [
    colors['Dataviz-purple'].$value,
    colors['Dataviz-orange'].$value,
] as const

export type ChartDataItemWithColor = ChartDataItem & { color: string }

export const assignColorsToData = (
    data: ChartDataItem[],
): ChartDataItemWithColor[] => {
    const colors =
        data.length === 2 ? TWO_DATA_POINTS_CHART_COLORS : CHART_COLORS

    return data.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
    }))
}
