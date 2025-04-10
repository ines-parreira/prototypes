import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/common/AnalyticsFooter.less'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'

export const generateTimeZoneMessage = (timeZone: string) =>
    `Analytics are using ${timeZone} timezone`

export const generateBusinessHoursTimeZoneMessage = (timeZone: string) =>
    `Analytics are using business hours timezone ${timeZone}`

type Props = {
    useBusinessHoursTimezone?: boolean
}

export const AnalyticsFooter = ({ useBusinessHoursTimezone }: Props) => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )
    const businessHours = useAppSelector(getBusinessHoursSettings)

    return (
        <div className={classnames(css.pageFooter, 'caption-regular')}>
            {useBusinessHoursTimezone && businessHours
                ? generateBusinessHoursTimeZoneMessage(
                      businessHours.data.timezone,
                  )
                : generateTimeZoneMessage(userTimezone)}
        </div>
    )
}
