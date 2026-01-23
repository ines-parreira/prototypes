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
        default: { width: 1, height: 3 },
        min: { width: 1, height: 3 },
        max: { width: 2, height: 5 },
    },
    [ChartType.Graph]: {
        default: { width: 2, height: 9 },
        min: { width: 1, height: 6 },
        max: { width: 4, height: 12 },
    },
    [ChartType.Table]: {
        default: { width: 4, height: 22 },
        min: { width: 2, height: 12 },
        max: { width: 4, height: 24 },
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
