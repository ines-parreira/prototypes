export const isValueOfStringEnum = <T extends Record<string, string>>(
    enumType: T,
    value: string,
): value is T[keyof T] => Object.values<string>(enumType).includes(value)
