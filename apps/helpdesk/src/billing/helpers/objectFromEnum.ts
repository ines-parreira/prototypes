/** ObjectFromEnum creates a type safe object from the provided enum and mapper
 * function. This is done because Object.fromEntries can miss keys and so cant
 * generate non-Partial<T> objects
 *
 * @param e Any object which can be used as an enum
 * @param mapper A function which maps from a provided key to the expected value
 * @returns An object which is type safe
 */
export function ObjectFromEnum<
    E extends Record<string, string | number>,
    T extends { [K in E[keyof E]]: T[K] } & {
        [K in Exclude<keyof T, E[keyof E]>]: never
    },
>(e: E, mapper: <K extends E[keyof E]>(key: K, index: number) => T[K]): T {
    const values = Object.values(e).filter(
        (v) =>
            typeof v === 'number' ||
            !Object.prototype.hasOwnProperty.call(e, v as any),
    ) as E[keyof E][]

    const entries = values.map(
        (key, index) => [key, mapper(key, index)] as const,
    )

    return Object.fromEntries(entries) as T
}
