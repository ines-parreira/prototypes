import classnames from 'classnames'

import css from 'domains/reporting/pages/common/AnalyticsFooter.less'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import useAppSelector from 'hooks/useAppSelector'
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
