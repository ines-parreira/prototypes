import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useCopyToClipboard } from '@repo/hooks'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from './CopyableField.less'

export type CopyableFieldProps = {
    value: string
    children?: React.ReactNode
    tooltip?: boolean
    ariaLabel?: string
    className?: string
    inline?: boolean
}

function truncateStr(value: string, length: number): string {
    if (value.length <= length) return value
    return value.substring(0, length) + '...'
}

export function CopyableField({
    value,
    children,
    tooltip,
    ariaLabel = 'Copy to clipboard',
    className,
    inline,
}: CopyableFieldProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const [, copyToClipboard] = useCopyToClipboard()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const isTrimmed = value.length > 80
    const shortenedValue = truncateStr(value, 80)

    const handleCopy = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            copyToClipboard(value)
            setIsTooltipOpen(true)

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
                setIsTooltipOpen(false)
            }, Duration.seconds(2))
        },
        [value, copyToClipboard],
    )

    const handleMouseLeave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setIsTooltipOpen(false)
    }, [])

    const handleTooltipOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setIsTooltipOpen(false)
        }
    }, [])

    const wrapperClassName = [inline ? css.fieldInline : css.field, className]
        .filter(Boolean)
        .join(' ')

    const content = (
        <div className={wrapperClassName}>
            {children ?? shortenedValue}
            <Tooltip
                isOpen={isTooltipOpen}
                onOpenChange={handleTooltipOpenChange}
                trigger={
                    <span
                        className={
                            inline ? css.copyButtonInline : css.copyButton
                        }
                        onMouseLeave={handleMouseLeave}
                    >
                        <Button
                            as="button"
                            icon="copy"
                            intent="regular"
                            variant="tertiary"
                            onClick={handleCopy}
                            aria-label={ariaLabel}
                        />
                    </span>
                }
            >
                <TooltipContent title="Copied to clipboard" />
            </Tooltip>
        </div>
    )

    if (isTrimmed && tooltip) {
        return (
            <Tooltip trigger={content}>
                <TooltipContent>
                    <pre className={css.tooltip}>{value}</pre>
                </TooltipContent>
            </Tooltip>
        )
    }

    return content
}
