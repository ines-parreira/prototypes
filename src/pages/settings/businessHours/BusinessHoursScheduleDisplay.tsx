import { useCallback } from 'react'

import classNames from 'classnames'

import { TimeFormatType } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import { getTimeFormatPreferenceSetting } from 'state/currentUser/selectors'

import { DAYS_OPTIONS } from './constants'
import { convertToAmPm } from './utils'

import css from './BusinessHoursScheduleDisplay.less'

type Props = {
    className?: string
    schedule: {
        days: string
        from_time: string
        to_time: string
    }[]
}

export default function BusinessHoursScheduleDisplay({
    schedule,
    className,
}: Props) {
    const timeFormatSetting = useAppSelector(getTimeFormatPreferenceSetting)

    const getBusinessHoursLabel = useCallback(
        (businessHours?: {
            days: string
            from_time: string
            to_time: string
        }) => {
            if (!businessHours) {
                return ''
            }

            let from_time =
                timeFormatSetting === TimeFormatType.AmPm
                    ? convertToAmPm(businessHours.from_time)
                    : businessHours.from_time
            let to_time =
                timeFormatSetting === TimeFormatType.AmPm
                    ? convertToAmPm(businessHours.to_time)
                    : businessHours.to_time

            const displayName = DAYS_OPTIONS.find(
                (day) => day.value === businessHours.days,
            )?.label

            const timeRange = `${from_time}-${to_time}`

            if (!displayName) {
                return timeRange
            }

            return `${displayName}, ${timeRange}`
        },
        [timeFormatSetting],
    )

    const scheduleDisplay = schedule
        .map((businessHours) => getBusinessHoursLabel(businessHours))
        .join(' | ')

    return (
        <div className={classNames(css.text, className)}>{scheduleDisplay}</div>
    )
}
