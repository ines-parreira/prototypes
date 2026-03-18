import type { UserDateTimePreferences } from '@repo/preferences'
import { DateFormatType, DurationInMs, TimeFormatType } from '@repo/utils'
import moment from 'moment'

type FormattedTicketTableDateTime = {
    cellLabel: string
    tooltipLabel: string
}

const DATE_FORMATS = {
    [DateFormatType.en_US]: 'MM/DD/YYYY',
    [DateFormatType.en_GB]: 'DD/MM/YYYY',
} as const

const TIME_FORMATS = {
    [TimeFormatType.TwentyFourHour]: 'HH:mm',
    [TimeFormatType.AmPm]: 'h:mma',
} as const

const getLocalMoment = (datetime: string, timezone?: string) => {
    const parsedDatetime = moment.utc(datetime)

    if (!parsedDatetime.isValid()) {
        return null
    }

    return timezone ? parsedDatetime.tz(timezone) : parsedDatetime
}

export function formatTicketTableDateTime(
    datetime: string | null | undefined,
    { dateFormat, timeFormat, timezone }: UserDateTimePreferences,
    now = moment.utc(),
): FormattedTicketTableDateTime | null {
    if (!datetime) {
        return null
    }

    const localDatetime = getLocalMoment(datetime, timezone)

    if (!localDatetime) {
        return null
    }

    const localNow = timezone ? now.clone().tz(timezone) : now.clone().utc()
    const dateFormatString = DATE_FORMATS[dateFormat]
    const timeFormatString = TIME_FORMATS[timeFormat]

    let cellLabel = localDatetime.format(dateFormatString)

    if (localDatetime.isSame(localNow, 'day')) {
        cellLabel = `Today at ${localDatetime.format(timeFormatString)}`
    } else if (
        localDatetime.isSame(localNow.clone().subtract(1, 'day'), 'day')
    ) {
        cellLabel = `Yesterday at ${localDatetime.format(timeFormatString)}`
    } else if (localDatetime.isSame(localNow.clone().add(1, 'day'), 'day')) {
        cellLabel = `Tomorrow at ${localDatetime.format(timeFormatString)}`
    } else if (Math.abs(localNow.diff(localDatetime)) < DurationInMs.OneWeek) {
        cellLabel = localDatetime.format('dddd')
    }

    return {
        cellLabel,
        tooltipLabel: localDatetime.format(
            `${dateFormatString} ${timeFormatString}`,
        ),
    }
}
