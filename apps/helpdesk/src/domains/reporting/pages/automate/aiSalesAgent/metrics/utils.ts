import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'

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
): TimeSeriesDataItem[] => {
    const matchingArray = dataItems?.find((arr) =>
        arr.some((item) => item.label === measure),
    )
    if (!matchingArray) return []

    // Just return the matching array - all properties from rawItem are already included
    return matchingArray
}
