import {Tooltip} from '@gorgias/ui-kit'
import React, {ComponentProps} from 'react'

import useId from 'hooks/useId'

type TooltipProps = ComponentProps<typeof Tooltip>

type LabelWithTooltipProps = {
    label: string
    tooltipText?: string
    className?: string
    tooltipProps?: Partial<TooltipProps>
}

export const LabelWithTooltip = ({
    label,
    tooltipText,
    className,
    tooltipProps,
}: LabelWithTooltipProps) => {
    const randomId = useId()
    const tooltipTargetID = 'label-tooltip-' + randomId

    return (
        <>
            <span id={tooltipTargetID} className={className}>{`${label}`}</span>
            <Tooltip
                innerProps={tooltipProps}
                target={tooltipTargetID}
                trigger={['hover']}
            >
                {tooltipText || label}
            </Tooltip>
        </>
    )
}
