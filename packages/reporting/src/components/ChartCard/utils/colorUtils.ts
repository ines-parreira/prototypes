import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import type { ChartDataItem } from '../types'

export const CHART_COLORS = [
    colors['heat-8'].$value,
    colors['heat-6'].$value,
    colors['heat-4'].$value,
    colors['heat-2'].$value,
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
