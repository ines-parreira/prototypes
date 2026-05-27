import { NOT_AVAILABLE_PLACEHOLDER } from '../../constants'

import { Y_AXIS_TICK_COUNT, Y_AXIS_WIDTH } from './constants'
import type {
    AxisTickValue,
    ComposedMetricTimeSeriesChartProps,
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMarker,
    ComposedMetricTimeSeriesMarkerPoint,
    ComposedMetricTimeSeriesMetricConfig,
    ResponsiveContainerWidth,
} from './types'

const AXIS_TICK_PRECISION = 6
const X_AXIS_LABEL_SAMPLING = {
    averageCharacterWidth: 7,
    defaultLabelCount: 7,
    horizontalPadding: 24,
    minWidth: 56,
} as const

export const getMetricValue = (
    data: ComposedMetricTimeSeriesDataItem,
    dataKey: string,
): number | null => {
    const value = data[dataKey]

    return typeof value === 'number' ? value : null
}

export const getTooltipMetricValue = (
    payload: any[],
    data: ComposedMetricTimeSeriesDataItem,
    dataKey: string,
): number | null => {
    const entry = payload.find((item) => item.dataKey === dataKey)

    return typeof entry?.value === 'number'
        ? entry.value
        : getMetricValue(data, dataKey)
}

export const formatMetricValue = (
    value: number | null,
    valueFormatter?: (value: number) => string,
) => {
    if (value === null) return NOT_AVAILABLE_PLACEHOLDER

    return valueFormatter ? valueFormatter(value) : String(value)
}

export const getTooltipDate = (
    data: ComposedMetricTimeSeriesDataItem,
    dateKey: string,
) => String(data[dateKey] ?? '')

export const getActiveMarkers = (
    markers: ComposedMetricTimeSeriesMarker[] = [],
    date: string,
) => markers.filter((marker) => marker.date === date)

export const getMarkerPoints = (
    data: ComposedMetricTimeSeriesDataItem[],
    markers: ComposedMetricTimeSeriesMarker[],
    dateKey: string,
    lineMetricDataKey: string,
): ComposedMetricTimeSeriesMarkerPoint[] =>
    markers.flatMap((marker) => {
        const dataItem = data.find(
            (item) => getTooltipDate(item, dateKey) === marker.date,
        )
        const value = dataItem
            ? getMetricValue(dataItem, lineMetricDataKey)
            : null

        return value === null ? [] : [{ ...marker, value }]
    })

export const resolveResponsiveContainerWidth = (
    containerWidth?: ComposedMetricTimeSeriesChartProps['containerWidth'],
): ResponsiveContainerWidth => {
    if (typeof containerWidth === 'number') return containerWidth
    if (typeof containerWidth === 'string' && containerWidth.endsWith('%')) {
        return containerWidth as ResponsiveContainerWidth
    }

    return '100%'
}

export const getNumericAxisTicks = (
    domain: ComposedMetricTimeSeriesMetricConfig['yAxisDomain'],
): number[] | undefined => {
    if (!domain) return undefined

    const [min, max] = domain

    if (
        typeof min !== 'number' ||
        typeof max !== 'number' ||
        !Number.isFinite(min) ||
        !Number.isFinite(max)
    ) {
        return undefined
    }

    if (min === max) return [min]

    const step = (max - min) / (Y_AXIS_TICK_COUNT - 1)

    return Array.from({ length: Y_AXIS_TICK_COUNT }, (_, index) =>
        Number((min + step * index).toFixed(AXIS_TICK_PRECISION)),
    )
}

export const getHorizontalGridValues = (ticks?: number[]) =>
    ticks && ticks.length > 1 ? ticks.slice(1) : ticks

const getXAxisValue = (
    data: ComposedMetricTimeSeriesDataItem,
    dateKey: string,
): AxisTickValue | null => {
    const value = data[dateKey]

    return typeof value === 'string' || typeof value === 'number' ? value : null
}

export const formatXAxisValue = (
    value: AxisTickValue,
    dateFormatter?: (date: string) => string,
) => {
    const rawValue = String(value)

    return dateFormatter ? dateFormatter(rawValue) : rawValue
}

const getEstimatedXAxisLabelWidth = (
    values: AxisTickValue[],
    dateFormatter?: (date: string) => string,
) => {
    const longestLabelLength = values.reduce<number>(
        (longestLength, value) =>
            Math.max(
                longestLength,
                formatXAxisValue(value, dateFormatter).length,
            ),
        0,
    )

    return Math.max(
        X_AXIS_LABEL_SAMPLING.minWidth,
        longestLabelLength * X_AXIS_LABEL_SAMPLING.averageCharacterWidth +
            X_AXIS_LABEL_SAMPLING.horizontalPadding,
    )
}

const getXAxisLabelCount = (
    values: AxisTickValue[],
    availableWidth?: number,
    dateFormatter?: (date: string) => string,
) => {
    if (!values.length) return 0

    if (!availableWidth || availableWidth <= 0) {
        return Math.min(X_AXIS_LABEL_SAMPLING.defaultLabelCount, values.length)
    }

    const plotWidth = Math.max(0, availableWidth - Y_AXIS_WIDTH * 2)
    const estimatedLabelWidth = getEstimatedXAxisLabelWidth(
        values,
        dateFormatter,
    )

    return Math.max(
        1,
        Math.min(values.length, Math.floor(plotWidth / estimatedLabelWidth)),
    )
}

export const sampleXAxisTickValues = (
    data: ComposedMetricTimeSeriesDataItem[],
    dateKey: string,
    availableWidth?: number,
    dateFormatter?: (date: string) => string,
): AxisTickValue[] => {
    const values = data.flatMap((item) => {
        const value = getXAxisValue(item, dateKey)

        return value === null ? [] : [value]
    })
    const labelCount = getXAxisLabelCount(values, availableWidth, dateFormatter)

    if (values.length <= labelCount) return values
    if (labelCount <= 1) return [values[0]]

    const lastIndex = values.length - 1
    const step = lastIndex / (labelCount - 1)
    const sampledIndexes = Array.from({ length: labelCount }, (_, index) =>
        Math.round(index * step),
    )

    return Array.from(new Set([0, ...sampledIndexes, lastIndex]))
        .sort((firstIndex, secondIndex) => firstIndex - secondIndex)
        .map((index) => values[index])
}
