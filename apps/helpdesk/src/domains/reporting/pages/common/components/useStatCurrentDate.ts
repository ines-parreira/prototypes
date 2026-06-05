import { useMemo } from 'react'

import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import useAppSelector from 'hooks/useAppSelector'
import {
    getBusinessHoursRangesByUserTimezone,
    getBusinessHoursSettings,
} from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'

type StatCurrentDate = {
    /** e.g. "Today, June 2nd" */
    dateLabel: string
    /** e.g. "Business hours 12:00 am - 11:59 pm Europe/Paris" */
    businessHoursLabel: string | undefined
}

/**
 * Resolves the current-day label and the account's business-hours range,
 * formatted in the current user's timezone. Shared by `StatCurrentDate`
 * and the Live agents panel header.
 */
export function useStatCurrentDate(): StatCurrentDate {
    const userTimezone = useAppSelector(getTimezone)
    const accountBusinessHours = useAppSelector(getBusinessHoursSettings)
    const businessRanges = useAppSelector(getBusinessHoursRangesByUserTimezone)

    const dateLabel = useMemo(() => {
        const today = userTimezone ? moment().tz(userTimezone) : moment()
        return `Today, ${today.format('MMMM Do')}`
    }, [userTimezone])

    const businessHoursLabel = useMemo(() => {
        const formattedRange = businessRanges
            ?.map(
                (range: Moment[]) =>
                    `${range[0].format('hh:mm a')} - ${range[1].format(
                        'hh:mm a',
                    )}`,
            )
            .join(', ')

        if (!formattedRange) {
            return undefined
        }

        const timezone = userTimezone || accountBusinessHours?.data.timezone

        return `Business hours ${formattedRange}${timezone ? ` ${timezone}` : ''}`
    }, [businessRanges, userTimezone, accountBusinessHours])

    return { dateLabel, businessHoursLabel }
}
