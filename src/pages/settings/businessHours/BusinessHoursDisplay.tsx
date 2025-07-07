import { Badge } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import { DAYS_OPTIONS } from './constants'

import css from './BusinessHoursDisplay.less'

type Props = {
    businessHours?: {
        days: string
        from_time: string
        to_time: string
    }
}

export default function BusinessHoursDisplay({ businessHours }: Props) {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)

    const defaultBusinessHours = businessHoursSettings?.data?.business_hours[0]

    if (!businessHours) {
        return (
            <div className={css.container}>
                <Badge>Default</Badge>
                {defaultBusinessHours && (
                    <div className={css.text}>
                        {getBusinessHoursLabel(defaultBusinessHours)}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={css.container}>
            <Badge>Custom</Badge>
            <div className={css.text}>
                {getBusinessHoursLabel(businessHours)}
            </div>
        </div>
    )
}

const getBusinessHoursLabel = (businessHours: {
    days: string
    from_time: string
    to_time: string
}) => {
    const displayName = DAYS_OPTIONS.find(
        (day) => day.value === businessHours.days,
    )?.label

    const timeRange = `${businessHours.from_time}-${businessHours.to_time}`

    if (!displayName) {
        return timeRange
    }

    return `${displayName}, ${timeRange}`
}
