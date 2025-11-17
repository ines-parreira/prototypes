import type React from 'react'
import { useRef, useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { useIsTruncated } from '../../hooks/useIsTruncated'

/// TODO: This is a temporary solution to sanitize the element id.
/// when the axiom tooltip(reactstrap) is fixed, we can remove this function
/// the reactstrap does not support "dom query like" characters ., #, [, ] in the id attribute
const sanitizeElementId = (text: string): string => {
    return text
        .replace(/[.#[\]]/g, '-') // Replace dots, hashes, brackets with hyphens
        .replace(/[^\w-]/g, '-') // Replace any other non-word chars with hyphens
        .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
        .toLowerCase()
}
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
    const [elementId] = useState(
        () => `truncated-text-${sanitizeElementId(text)}`,
    )

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
