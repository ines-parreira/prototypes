export const notNull = <T>(val: T | null): val is T => {
    return val !== null
}

export const notUndefined = <T>(val: T | undefined): val is T => {
    return val !== undefined
}

export const isValueOfStringEnum = <T extends Record<string, string>>(
    enumType: T,
    value: string
): value is T[keyof T] => Object.values<string>(enumType).includes(value)
