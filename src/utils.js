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

export function lastMessage(messages) {
    return messages.sort((m1, m2) => moment(m1).diff(moment(m2)))[0]
}
