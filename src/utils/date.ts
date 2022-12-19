import moment, {Moment} from 'moment-timezone'

/**
 * Convert a string to a moment object if the string represents a valid datetime, else returns null.
 */
export const stringToDatetime = (data: string): Moment | null => {
    let datetime = null

    if (data) {
        const momentDt = moment(data)

        if (momentDt.isValid()) {
            datetime = momentDt
        }
    }

    return datetime
}

/**
 * Return moment()
 *
 * We encapsulate it here so that it's easy to mock during tests.
 */
export const getMoment = () => {
    return moment()
}

/**
 * Return moment.now()
 *
 * We encapsulate it here so that it's easy to mock during tests.
 */
export const getMomentNow = () => {
    return moment.now()
}

/**
 * Return moment.utc().toISOString()
 *
 * We encapsulate it here so that it's easy to mock during tests.
 */
export const getMomentUtcISOString = () => {
    return moment.utc().toISOString()
}

/**
 * Return moment.tz.names()
 *
 * We encapsulate it here so that it's easy to mock during tests.
 */
export const getMomentTimezoneNames = () => {
    return moment.tz.names()
}

export const getFormattedDate = (date: string, locale?: string) => {
    if (isNaN(Date.parse(date))) {
        throw new Error('Invalid date')
    }
    return new Intl.DateTimeFormat(locale ?? 'en-US').format(new Date(date))
}

export const getDetailedFormattedDate = (date: string, locale?: string) => {
    if (isNaN(Date.parse(date))) {
        throw new Error('Invalid date')
    }
    return new Intl.DateTimeFormat(locale ?? 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(new Date(date))
}
