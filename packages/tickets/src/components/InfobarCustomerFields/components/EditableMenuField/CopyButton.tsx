import type { MouseEvent } from 'react'
import { useCallback, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import classnames from 'classnames'
import { useCopyToClipboard } from '@gorgias/toolkit-react'

import { Icon, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from './CopyButton.less'

type CopyButtonProps = {
    value: string
    isVisible: boolean
}

export function CopyButton({ value, isVisible }: CopyButtonProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const [, copyToClipboard] = useCopyToClipboard()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleCopyClick = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
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

    return (
        <Tooltip
            isOpen={isTooltipOpen}
            onOpenChange={setIsTooltipOpen}
            trigger={
                <span
                    role="button"
                    onPointerDown={handleCopyClick}
                    onMouseLeave={handleMouseLeave}
                    className={classnames({
                        [css.hidden]: !isVisible,
                    })}
                >
                    <Icon name="copy" size="sm" />
                </span>
            }
        >
            <TooltipContent title="Copied to clipboard" />
        </Tooltip>
    )
}
