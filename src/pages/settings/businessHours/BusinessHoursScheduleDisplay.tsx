import classNames from 'classnames'

import { BusinessHoursConfig } from '@gorgias/helpdesk-types'

import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'

import css from './BusinessHoursScheduleDisplay.less'

type Props = {
    className?: string
    businessHoursConfig?: BusinessHoursConfig
}

export default function BusinessHoursScheduleDisplay({
    businessHoursConfig,
    className,
}: Props) {
    const { getBusinessHoursConfigLabel } = useBusinessHours()

    return (
        <div className={classNames(css.text, className)}>
            {businessHoursConfig
                ? getBusinessHoursConfigLabel(businessHoursConfig)
                : ''}
        </div>
    )
}
