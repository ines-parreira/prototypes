// @flow
import moment from 'moment'

/**
 * Convert a string to a moment object if the string represents a valid datetime, else returns null.
 * @param data: the string representing a datetime
 * @returns {moment, null}: the moment object or null
 */
export const stringToDatetime = (data: string) : moment | null => {
    let datetime = null

    if (data) {
        const momentDt = moment(data)

        if (momentDt.isValid()) {
            datetime = momentDt
        }
    }

    return datetime
}
