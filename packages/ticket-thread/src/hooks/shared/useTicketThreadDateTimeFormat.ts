import { useUserDateTimePreferences } from '@repo/preferences'
import { DateAndTimeFormatting, getDateAndTimeFormat } from '@repo/utils'

export function useTicketThreadDateTimeFormat() {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    return {
        datetimeFormat: getDateAndTimeFormat(
            dateFormat,
            timeFormat,
            DateAndTimeFormatting.RelativeDateAndTime,
        ),
        compactDateWithTimeFormat: getDateAndTimeFormat(
            dateFormat,
            timeFormat,
            DateAndTimeFormatting.CompactDateWithTime,
        ),
        timezone,
    }
}
