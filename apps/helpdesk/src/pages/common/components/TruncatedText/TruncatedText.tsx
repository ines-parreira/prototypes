import React, { useRef, useState } from 'react'

import { Tooltip } from '@gorgias/axiom'

import { useIsTruncated } from '../../hooks/useIsTruncated'

interface TruncatedTextProps {
    text: string
    className?: string
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
    text,
    className,
    tooltipPlacement = 'bottom',
}) => {
    const textRef = useRef<HTMLSpanElement>(null)
    const isTruncated = useIsTruncated(textRef, text)
    const [elementId] = useState(() => `truncated-text-${text}`)

    return (
        <>
            <span ref={textRef} id={elementId} className={className}>
                {text}
            </span>
            {isTruncated && (
                <Tooltip target={elementId} placement={tooltipPlacement}>
                    {text}
                </Tooltip>
            )}
        </>
    )
}
