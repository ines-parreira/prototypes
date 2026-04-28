import {
    fromAbsolute,
    getLocalTimeZone,
    parseDateTime,
    toTime,
    toZoned,
} from '@internationalized/date'

export const getScheduleDefaults = (scheduledDt?: string) => {
    if (scheduledDt) {
        const utcZoned = toZoned(parseDateTime(scheduledDt), 'UTC')
        const local = fromAbsolute(
            utcZoned.toDate().getTime(),
            getLocalTimeZone(),
        )
        return {
            scheduleType: 'later' as const,
            scheduledDate: local,
            scheduledTime: toTime(local),
        }
    }
    return {
        scheduleType: 'immediate' as const,
        scheduledDate: null,
        scheduledTime: null,
    }
}
