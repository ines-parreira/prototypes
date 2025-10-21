import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { Box, Label, Tooltip } from '@gorgias/axiom'
import { BusinessHoursConfig } from '@gorgias/helpdesk-types'

import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'
import { useTextOverflow } from 'pages/common/hooks/useTextOverflow'

import css from './BusinessHoursScheduleDisplay.less'

type Props = {
    className?: string
    businessHoursConfig?: BusinessHoursConfig
}

export default function BusinessHoursScheduleDisplay({
    businessHoursConfig,
    className,
}: Props) {
    const tooltipTargetID = 'business-hours-schedule-display-' + useId()
    const {
        getBusinessHoursConfigTimeFrameLabelList,
        getBusinessHoursConfigLabel,
    } = useBusinessHours()
    const { ref, isOverflowing } = useTextOverflow<HTMLDivElement>()

    const businessHoursConfigLabel = businessHoursConfig
        ? getBusinessHoursConfigLabel(businessHoursConfig)
        : ''

    return (
        <>
            <div
                ref={ref}
                className={classNames(css.text, className)}
                id={tooltipTargetID}
            >
                {businessHoursConfigLabel}
            </div>
            <Tooltip
                target={tooltipTargetID}
                trigger={['hover']}
                disabled={!isOverflowing}
            >
                {businessHoursConfig && (
                    <Box p="lg" flexDirection="column">
                        <Label>Schedule</Label>
                        <Box flexDirection="column" gap="xs" p="xs">
                            {getBusinessHoursConfigTimeFrameLabelList(
                                businessHoursConfig,
                            ).map((timeframe, index) => (
                                <div key={`timeframe-${index}`}>
                                    {timeframe}
                                </div>
                            ))}
                        </Box>
                    </Box>
                )}
            </Tooltip>
        </>
    )
}
