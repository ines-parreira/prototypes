import _snakeCase from 'lodash/snakeCase'

const deepMapKeys = (formatter: (value: string) => string) => {
    /* eslint-disable @typescript-eslint/no-unsafe-return */
    const format = (params: any): any => {
        return !params || typeof params !== 'object'
            ? params
            : Array.isArray(params)
            ? params.map(format)
            : Object.keys(params).reduce(
                  (acc, key) => ({
                      ...acc,
                      [formatter(key)]: format(
                          (params as Record<string, unknown>)[key]
                      ),
                  }),
                  {}
              )
    }
    /* eslint-enable */
    return format
}

export type SnakeCaseString<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T>
          ? '_'
          : ''}${Lowercase<T>}${SnakeCaseString<U>}`
    : S

export type SnakeCaseObject<T extends Record<string, unknown>> = {
    [K in keyof T as SnakeCaseString<K & string>]: T[K]
}

export const deepMapKeysToSnakeCase: <T extends Record<string, unknown>>(
    value: T
) => SnakeCaseObject<T> = deepMapKeys(_snakeCase)
