import { ChartType } from 'domains/reporting/pages/dashboards/types'

export type ChartLayoutConstraints = {
    default: {
        width: number
        height: number
    }
    min: {
        width: number
        height: number
    }
    max: {
        width: number
        height: number
    }
}

const baseConstraints: Record<ChartType, ChartLayoutConstraints> = {
    [ChartType.Card]: {
        default: { width: 3, height: 4 },
        min: { width: 3, height: 4 },
        max: { width: 6, height: 16 },
    },
    [ChartType.Graph]: {
        default: { width: 6, height: 14 },
        min: { width: 3, height: 8 },
        max: { width: 12, height: 24 },
    },
    [ChartType.Table]: {
        default: { width: 12, height: 22 },
        min: { width: 6, height: 14 },
        max: { width: 12, height: 48 },
    },
}

export const getChartConstraints = (
    chartType: ChartType,
): ChartLayoutConstraints => {
    return baseConstraints[chartType]
}

export const getMaxChartHeight = (): number => {
    return Math.max(
        ...Object.values(baseConstraints).map(
            (constraint) => constraint.max.height,
        ),
    )
}
