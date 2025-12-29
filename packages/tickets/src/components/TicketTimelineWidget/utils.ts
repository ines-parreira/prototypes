import moment from 'moment'

export function formatTicketTime(
    createdDatetime: string,
    now: moment.Moment = moment(),
): string {
    const created = moment(createdDatetime)
    const diffMinutes = now.diff(created, 'minutes')
    const diffHours = now.diff(created, 'hours')
    const diffDays = now.diff(created, 'days')

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`
    }

    if (diffHours < 24) {
        return `${diffHours}hr ago`
    }

    if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }

    return created.format('MM/DD/YY')
}
