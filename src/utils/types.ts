export const notNull = <T>(val: T | null): val is T => {
    return val !== null
}

export const notUndefined = <T>(val: T | undefined): val is T => {
    return val !== undefined
}
