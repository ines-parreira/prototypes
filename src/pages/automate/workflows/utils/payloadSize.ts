const MAX_SIZE_IN_BYTES = 1024 * 1024

export const getPayloadSizeToLimitRate = (value: unknown): number => {
    return new Blob([JSON.stringify(value)]).size / MAX_SIZE_IN_BYTES
}

export const isPayloadTooLarge = (value: unknown): boolean => {
    return getPayloadSizeToLimitRate(value) > 1
}
