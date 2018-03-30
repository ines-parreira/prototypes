// @flow
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
