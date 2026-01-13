import type { ReactNode } from 'react'
import { useRef } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import { useIsTruncated } from 'pages/common/hooks/useIsTruncated'

import css from './TruncatedTextWithTooltip.less'

type TruncatedTextWithTooltipProps = {
    children: ReactNode
    tooltipContent: string
    className?: string
}

export const TruncatedTextWithTooltip = ({
    children,
    tooltipContent,
    className,
}: TruncatedTextWithTooltipProps) => {
    const textRef = useRef<HTMLDivElement>(null)
    const isTruncated = useIsTruncated(textRef, tooltipContent)

    return (
        <Tooltip delay={0} isDisabled={!isTruncated}>
            <TooltipTrigger>
                <div
                    ref={textRef}
                    className={`${css.truncated} ${className || ''}`}
                >
                    {children}
                </div>
            </TooltipTrigger>
            <TooltipContent caption={tooltipContent}></TooltipContent>
        </Tooltip>
    )
}
