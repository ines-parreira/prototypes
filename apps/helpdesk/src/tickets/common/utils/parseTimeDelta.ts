import moment from 'moment'

export default function parseTimeDelta(timedelta: string) {
    const timedeltaRegex = /^(?<value>\d+)(?<unit>[mhd])$/
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const groups = timedelta.match(timedeltaRegex)?.groups
    if (groups) {
        const { value, unit } = groups
        return moment.duration(Number(value), unit as any)
    }
    throw new Error(`${timedelta} is not a properly formatted timedelta`)
}
