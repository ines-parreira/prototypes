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

const PATH_HEIGHT_OFFSET = 1

const baseConstraints: Record<ChartType, ChartLayoutConstraints> = {
    [ChartType.Card]: {
        default: { width: 3, height: 4 },
        min: { width: 3, height: 4 },
        max: { width: 6, height: 16 },
    },
    [ChartType.CardWithTimeseries]: {
        default: { width: 3, height: 5 },
        min: { width: 3, height: 5 },
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
    showMetricOrigin = false,
): ChartLayoutConstraints => {
    const constraints = baseConstraints[chartType]
    if (!showMetricOrigin) return constraints
    return {
        default: {
            width: constraints.default.width,
            height: constraints.default.height + PATH_HEIGHT_OFFSET,
        },
        min: {
            width: constraints.min.width,
            height: constraints.min.height + PATH_HEIGHT_OFFSET,
        },
        max: {
            width: constraints.max.width,
            height: constraints.max.height + PATH_HEIGHT_OFFSET,
        },
    }
}

export const getMaxChartHeight = (): number => {
    // Always return the largest possible max height (with metric origin path shown)
    // so placement search bounds are always sufficient
    return (
        Math.max(
            ...Object.values(baseConstraints).map(
                (constraint) => constraint.max.height,
            ),
        ) + PATH_HEIGHT_OFFSET
    )
}
