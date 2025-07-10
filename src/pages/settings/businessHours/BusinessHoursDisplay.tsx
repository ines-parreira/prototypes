import { Badge } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import BusinessHoursScheduleDisplay from './BusinessHoursScheduleDisplay'

import css from './BusinessHoursDisplay.less'

type Props = {
    businessHours?: {
        days: string
        from_time: string
        to_time: string
    }[]
}

export default function BusinessHoursDisplay({ businessHours }: Props) {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)

    const defaultBusinessHours = businessHoursSettings?.data?.business_hours

    if (!businessHours) {
        return (
            <div className={css.container}>
                <Badge type="light-dark">Default</Badge>
                {defaultBusinessHours && (
                    <BusinessHoursScheduleDisplay
                        schedule={defaultBusinessHours}
                    />
                )}
            </div>
        )
    }

    return (
        <div className={css.container}>
            <Badge type="light-warning">Custom</Badge>
            <BusinessHoursScheduleDisplay schedule={businessHours} />
        </div>
    )
}
