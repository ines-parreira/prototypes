import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

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
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        const element = textRef.current
        if (element) {
            setIsTruncated(element.scrollWidth > element.clientWidth)
        }
    }, [tooltipContent])

    const content = (
        <div ref={textRef} className={`${css.truncated} ${className || ''}`}>
            {children}
        </div>
    )

    if (!isTruncated) {
        return content
    }

    return (
        <Tooltip delay={0}>
            <TooltipTrigger>{content}</TooltipTrigger>
            <TooltipContent>
                <div className={css.tooltipContent}>{tooltipContent}</div>
            </TooltipContent>
        </Tooltip>
    )
}
