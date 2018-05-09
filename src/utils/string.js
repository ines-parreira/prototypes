// @flow
import _isString from 'lodash/isString'

/**
 * Remove a suffix from a string
 * @param data: the string from which we want to remove the suffix
 * @param suffix: the suffix to remove from the string
 * @returns {string}: the data without the suffix
 */
export const removeSuffix = (data: string, suffix: string) : string => {
    if (typeof data === 'string' && data.endsWith(suffix)) {
        return data.replace(suffix, '')
    }

    return data
}

/**
 * Count lines of a text
 *
 * @param {string} text - the text for which we want to count lines
 * @returns {number} - the number of lines in the given text
 */
export const countLines = (text: string): number => {
    if (!_isString(text)) {
        return 0
    }

    return text.split(/\r\n|\r|\n/).length
}
