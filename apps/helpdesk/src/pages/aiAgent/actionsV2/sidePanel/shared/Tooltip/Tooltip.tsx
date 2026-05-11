import type { ReactNode } from 'react'

import type { IconName } from '@gorgias/axiom'
import { Icon, IconSize, Tooltip, TooltipContent } from '@gorgias/axiom'

export { Tooltip, TooltipContent }

type InfoTooltipProps = {
    content: ReactNode
    iconName?: IconName
    ariaLabel?: string
}

export const InfoTooltip = ({
    content,
    iconName = 'info',
    ariaLabel = 'More information',
}: InfoTooltipProps) => {
    const tooltipContent =
        typeof content === 'string' ? (
            <TooltipContent caption={content} />
        ) : (
            <TooltipContent>{content}</TooltipContent>
        )

    return (
        <Tooltip
            trigger={
                <span aria-label={ariaLabel} role="img">
                    <Icon name={iconName} size={IconSize.Xs} />
                </span>
            }
        >
            {tooltipContent}
        </Tooltip>
    )
}
