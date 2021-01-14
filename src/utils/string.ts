import _isString from 'lodash/isString'

/**
 * Remove a suffix from a string
 */
export const removeSuffix = (data: string, suffix: string): string => {
    if (typeof data === 'string' && data.endsWith(suffix)) {
        return data.replace(suffix, '')
    }

    return data
}

/**
 * Count lines of a text
 */
export const countLines = (text: string): number => {
    if (!_isString(text)) {
        return 0
    }

    return text.split(/\r\n|\r|\n/).length
}
