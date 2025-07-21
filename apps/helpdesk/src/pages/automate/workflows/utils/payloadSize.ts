export const getPayloadSizeToLimitRate = (
    value: unknown,
    limit: number,
): number => {
    return new Blob([JSON.stringify(value)]).size / limit
}

export const isPayloadTooLarge = (value: unknown, limit: number): boolean => {
    return getPayloadSizeToLimitRate(value, limit) > 1
}
