// Make typescript happy when updating a record with values of another
// record with the same keys / type
export function updateRecord<
    R extends Record<string, unknown>,
    K extends keyof R
>(record: R, key: K, value: R[K]) {
    record[key] = value
}

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
