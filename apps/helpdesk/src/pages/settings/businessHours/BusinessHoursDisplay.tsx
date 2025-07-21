import { BusinessHoursConfig } from '@gorgias/helpdesk-types'
import { Badge } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import BusinessHoursScheduleDisplay from './BusinessHoursScheduleDisplay'

import css from './BusinessHoursDisplay.less'

type Props = {
    businessHours?: BusinessHoursConfig
}

export default function BusinessHoursDisplay({ businessHours }: Props) {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)

    const defaultBusinessHours = businessHoursSettings?.data as
        | BusinessHoursConfig
        | undefined

    if (!businessHours) {
        return (
            <div className={css.container}>
                <Badge type="light-dark">Default</Badge>
                {defaultBusinessHours && (
                    <BusinessHoursScheduleDisplay
                        businessHoursConfig={defaultBusinessHours}
                    />
                )}
            </div>
        )
    }

    return (
        <div className={css.container}>
            <Badge type="light-warning">Custom</Badge>
            <BusinessHoursScheduleDisplay businessHoursConfig={businessHours} />
        </div>
    )
}
