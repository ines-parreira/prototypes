import type { DateFormatType, TimeFormatType } from '@repo/utils'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

export function formatCreatedAt(
    createdAt: string | undefined,
    dateFormat: DateFormatType,
    timeFormat: TimeFormatType,
): string {
    if (!createdAt) {
        return '-'
    }
    return formatDatetime(
        createdAt,
        getDateAndTimeFormat(
            dateFormat,
            timeFormat,
            DateAndTimeFormatting.CompactDate,
        ),
    )
}
