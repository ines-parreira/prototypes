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

export const deepMapKeysToSnakeCase: <T extends Record<string, unknown>>(
    value: T
) => {[key: string]: T[keyof T]} = deepMapKeys(_snakeCase)
