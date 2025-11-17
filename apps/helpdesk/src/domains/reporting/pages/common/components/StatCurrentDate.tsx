import React, { useMemo } from 'react'

import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import css from 'domains/reporting/pages/common/components/StatCurrentDate.less'
import useAppSelector from 'hooks/useAppSelector'
import {
    getBusinessHoursRangesByUserTimezone,
    getBusinessHoursSettings,
} from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'

export default function StatCurrentDate() {
    const userTimezone = useAppSelector(getTimezone)
    const accountBusinessHours = useAppSelector(getBusinessHoursSettings)
    const businessRanges = useAppSelector(getBusinessHoursRangesByUserTimezone)
    const today = useMemo(() => {
        return userTimezone ? moment().tz(userTimezone) : moment()
    }, [userTimezone])
    const formattedRange = useMemo(() => {
        return businessRanges
            ?.map(
                (range: Moment[]) =>
                    `${range[0].format('hh:mm a')} - ${range[1].format(
                        'hh:mm a',
                    )}`,
            )
            .join(', ')
    }, [businessRanges])

    return (
        <div className={css.wrapper}>
            <span className={css.date}>Today, {today.format('MMMM Do')}</span>
            {formattedRange && (
                <span className={css.businessHours}>
                    Business hours {formattedRange}{' '}
                    {userTimezone || accountBusinessHours?.data.timezone}
                </span>
            )}
        </div>
    )
}
