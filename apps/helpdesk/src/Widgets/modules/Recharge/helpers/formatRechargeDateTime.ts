import moment from 'moment'

export function formatRechargeDateTime(dateTime?: string): string {
    if (!dateTime || !moment(dateTime).isValid()) return ''
    return moment(dateTime).tz('US/Eastern', true).toISOString(true)
}
