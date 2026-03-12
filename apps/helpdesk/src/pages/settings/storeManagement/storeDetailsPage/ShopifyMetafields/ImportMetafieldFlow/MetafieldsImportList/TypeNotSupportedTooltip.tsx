import type { DOMAttributes, ReactElement } from 'react'

import { Text, Tooltip, TooltipContent } from '@gorgias/axiom'

type TypeNotSupportedTooltipProps = {
    trigger: ReactElement<DOMAttributes<HTMLButtonElement>, string>
}

export default function TypeNotSupportedTooltip({
    trigger,
}: TypeNotSupportedTooltipProps) {
    return (
        <Tooltip placement="top left" trigger={trigger}>
            <TooltipContent>
                <Text size="sm">
                    Gorgias does not support this <br />
                    metafield type.
                </Text>
            </TooltipContent>
        </Tooltip>
    )
}
