//@flow
import _camelCase from 'lodash/camelCase'
import _snakeCase from 'lodash/snakeCase'

const deepMapKeys = (formatter: (string) => string) => {
    const format = (params: any): any => {
        return !params || typeof params !== 'object' ?
            params
            : Array.isArray(params) ?
                params.map(format)
                :
                Object.keys(params)
                    .reduce((acc, key) => ({
                        ...acc,
                        [formatter(key)]: format(params[key]),
                    }), {})
    }
    return format
}

export const deepMapKeysToSnakeCase = deepMapKeys(_snakeCase)

export const deepMapKeysToCamelCase = deepMapKeys(_camelCase)
