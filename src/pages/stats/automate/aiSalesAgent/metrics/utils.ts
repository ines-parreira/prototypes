import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'

export const infinityNanToZero = (value: number) => {
    return isNaN(value) || value === Infinity ? 0 : value
}

export const calculateRate = (
    numerator?: number | null,
    denominator?: number | null,
): number => {
    if (denominator === 0 && (numerator || 0) > 0) {
        return 1.0
    }

    if (!denominator || !numerator) {
        return 0
    }

    return infinityNanToZero(numerator / denominator)
}

export const getStatsByMeasure = (
    measure: string,
    dataItems?: TimeSeriesDataItem[][],
): TimeSeriesDataItem[] =>
    dataItems?.find((arr) => arr.some((item) => item.label === measure)) || []
