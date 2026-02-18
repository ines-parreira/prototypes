const TIMEDELTA_REGEX = /^[\d]+[a-z]$/
const SINGLEQUOTE_RAW_TIMEDELTA_REGEX = /^'[\d]+[a-z]'$/
const DOUBLEQUOTE_RAW_TIMEDELTA_REGEX = /^"[\d]+[a-z]"$/

/**
 * Return whether the input string `data` represents a timedelta or not.
 */
export const isTimedelta = (data: any, raw = false): boolean => {
    if (typeof data !== 'string' || !data) {
        return false
    }

    if (raw) {
        return (
            //eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            !!data.match(DOUBLEQUOTE_RAW_TIMEDELTA_REGEX) ||
            //eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            !!data.match(SINGLEQUOTE_RAW_TIMEDELTA_REGEX)
        )
    }

    //eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    return !!data.match(TIMEDELTA_REGEX)
}
