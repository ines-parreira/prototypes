import type { DateFormatType, TimeFormatType } from '@repo/utils'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

export function formatOrderDate(
    createdDatetime: string,
    dateFormat?: DateFormatType,
    timeFormat?: TimeFormatType,
    timezone?: string,
    now: Date = new Date(),
): string {
    const created = new Date(createdDatetime)
    const diffMs = now.getTime() - created.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`
    }

    if (diffHours < 24) {
        return `${diffHours}hr ago`
    }

    if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }

    if (dateFormat && timeFormat) {
        const formatType = timezone
            ? DateAndTimeFormatting.CompactDate
            : DateAndTimeFormatting.ShortDateWithYear
        return formatDatetime(
            createdDatetime,
            getDateAndTimeFormat(dateFormat, timeFormat, formatType),
            timezone,
        )
    }

    return created.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}
