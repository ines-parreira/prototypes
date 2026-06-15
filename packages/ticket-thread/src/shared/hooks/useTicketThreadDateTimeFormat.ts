import { useUserDateTimePreferences } from '@repo/preferences'
import { DateAndTimeFormatting, getDateAndTimeFormat } from '@repo/utils'

export function useTicketThreadDateTimeFormat() {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    return {
        format: {
            relative: getDateAndTimeFormat(
                dateFormat,
                timeFormat,
                DateAndTimeFormatting.RelativeDateAndTime,
            ),
            compact: getDateAndTimeFormat(
                dateFormat,
                timeFormat,
                DateAndTimeFormatting.CompactDateWithTime,
            ),
        },
        timezone,
    }
}
