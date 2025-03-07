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
