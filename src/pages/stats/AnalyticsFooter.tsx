import classnames from 'classnames'
import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/AnalyticsFooter.less'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {getTimezone} from 'state/currentUser/selectors'

export const generateTimeZoneMessage = (timeZone: string) =>
    `Analytics are using ${timeZone} timezone`

export const AnalyticsFooter = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    return (
        <div className={classnames(css.pageFooter, 'caption-regular')}>
            {generateTimeZoneMessage(userTimezone)}
        </div>
    )
}
