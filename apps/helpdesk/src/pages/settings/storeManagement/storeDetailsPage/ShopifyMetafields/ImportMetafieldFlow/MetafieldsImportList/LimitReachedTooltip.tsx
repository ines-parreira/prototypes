import type { ReactNode } from 'react'

import { Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { MAX_FIELDS_PER_CATEGORY } from '../../constants'

type LimitReachedTooltipProps = {
    children: ReactNode
}

export default function LimitReachedTooltip({
    children,
}: LimitReachedTooltipProps) {
    return (
        <Tooltip placement="top left" trigger={<div>{children}</div>}>
            <TooltipContent>
                <Text size="sm">
                    Limit reached: you can only import <br />
                    {MAX_FIELDS_PER_CATEGORY} metafields in this category.
                </Text>
            </TooltipContent>
        </Tooltip>
    )
}
