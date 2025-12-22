import type { ReactNode } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import { MAX_FIELDS_PER_CATEGORY } from '../../constants'

type LimitReachedTooltipProps = {
    children: ReactNode
}

export default function LimitReachedTooltip({
    children,
}: LimitReachedTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <div>{children}</div>
            </TooltipTrigger>
            <TooltipContent
                title="Import Limit Reached"
                caption={`You can only import ${MAX_FIELDS_PER_CATEGORY} items`}
            />
        </Tooltip>
    )
}
