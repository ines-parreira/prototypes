import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import moment, {Moment} from 'moment-timezone'

import {
    getBusinessHoursRangesByUserTimezone,
    getBusinessHoursSettings,
} from '../../../../state/currentAccount/selectors'
import {getTimezone} from '../../../../state/currentUser/selectors'

import css from './StatCurrentDate.less'

export default function StatCurrentDate() {
    const userTimezone = useSelector(getTimezone)
    const accountBusinessHours = useSelector(getBusinessHoursSettings)
    const businessRanges = useSelector(getBusinessHoursRangesByUserTimezone)
    const today = useMemo(() => {
        return userTimezone ? moment().tz(userTimezone) : moment()
    }, [userTimezone])
    const formattedRange = useMemo(() => {
        return businessRanges
            ?.map(
                (range: [Moment, Moment]) =>
                    `${range[0].format('hh:mm a')} - ${range[1].format(
                        'hh:mm a'
                    )}`
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
