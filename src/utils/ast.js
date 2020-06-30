// @flow
const TIMEDELTA_REGEX = /^[\d]+[a-z]$/
const SINGLEQUOTE_RAW_TIMEDELTA_REGEX = /^'[\d]+[a-z]'$/
const DOUBLEQUOTE_RAW_TIMEDELTA_REGEX = /^"[\d]+[a-z]"$/

/**
 * Return whether the input string `data` represents a timedelta or not.
 * @param data: the data which may be a string representing a timedelta
 * @param raw: whether we're look for a raw timedelta or not (default: false)
 * @returns {boolean}: whether data represents a timedelta or not
 */
export const isTimedelta = (data: any, raw: boolean = false): boolean => {
    if (typeof data !== 'string' || !data) {
        return false
    }

    if (raw) {
        return (
            !!data.match(DOUBLEQUOTE_RAW_TIMEDELTA_REGEX) ||
            !!data.match(SINGLEQUOTE_RAW_TIMEDELTA_REGEX)
        )
    }

    return !!data.match(TIMEDELTA_REGEX)
}
