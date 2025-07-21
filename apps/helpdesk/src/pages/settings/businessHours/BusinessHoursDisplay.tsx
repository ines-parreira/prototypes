import cn from 'classnames'

import { useListAccountSettings } from '@gorgias/helpdesk-queries'
import {
    BusinessHoursConfig,
    BusinessHoursTimeframe,
    Timezone,
} from '@gorgias/helpdesk-types'
import { Badge } from '@gorgias/merchant-ui-kit'

import BusinessHoursScheduleDisplay from './BusinessHoursScheduleDisplay'

import css from './BusinessHoursDisplay.less'

type Props = {
    businessHours?: BusinessHoursConfig
    className?: string
}

export default function BusinessHoursDisplay({
    businessHours,
    className,
}: Props) {
    const { data } = useListAccountSettings({ type: 'business-hours' })
    const defaultBusinessHours = data?.data.data[0]?.data as
        | {
              timezone: Timezone
              business_hours: BusinessHoursTimeframe[]
          }
        | undefined

    if (!businessHours) {
        return (
            <div className={cn(css.container, className)}>
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
        <div className={cn(css.container, className)}>
            <Badge type="light-warning">Custom</Badge>
            <BusinessHoursScheduleDisplay businessHoursConfig={businessHours} />
        </div>
    )
}
