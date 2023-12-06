import React from 'react'
import Tooltip from 'pages/common/components/Tooltip'
import useId from 'hooks/useId'

export const LabelWithTooltip = ({label}: {label: string}) => {
    const randomId = useId()
    const tooltipTargetID = 'label-tooltip-' + randomId

    return (
        <>
            <span id={tooltipTargetID}>{` ${label}`}</span>
            <Tooltip target={tooltipTargetID} trigger={['hover']}>
                {label}
            </Tooltip>
        </>
    )
}
