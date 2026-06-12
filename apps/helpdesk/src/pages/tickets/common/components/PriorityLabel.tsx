import { forwardRef, useImperativeHandle, useRef } from 'react'

import cn from 'classnames'
import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import { LegacyBadge as Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'
import type { TicketPriority } from '@gorgias/helpdesk-types'
import { capitalize } from '@gorgias/toolkit'

import css from './PriorityLabel.less'

export const PRIORITY_TO_BADGE: Record<TicketPriority, ColorType> = {
    low: 'light-grey',
    normal: 'light-dark',
    high: 'light-warning',
    critical: 'light-error',
}

type PriorityLabelProps = {
    className?: string
    displayLabel?: boolean
    hasTooltip?: boolean
    priority?: TicketPriority
}

export const PriorityLabel = forwardRef<HTMLDivElement, PriorityLabelProps>(
    ({ className, displayLabel = true, hasTooltip = false, priority }, ref) => {
        const type = priority
            ? (PRIORITY_TO_BADGE[priority] ?? 'modern')
            : 'modern'

        const elementRef = useRef<HTMLDivElement>(null)
        useImperativeHandle(ref, () => elementRef.current!)

        return (
            <>
                <Badge
                    ref={elementRef}
                    className={cn({ [css.badge]: !displayLabel }, className)}
                    type={type}
                >
                    <i className={cn(css.icon, priority && css[priority])} />
                    {displayLabel && priority}
                </Badge>
                {hasTooltip && (
                    <Tooltip target={elementRef}>
                        {`Priority: ${capitalize(priority ?? '')}`}
                    </Tooltip>
                )}
            </>
        )
    },
)
