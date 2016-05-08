import moment from 'moment'
import 'moment-timezone'

export function formatDatetime(datetime, timezone) {
    try {
        return moment(datetime).tz(timezone || 'UTC').calendar()
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}
