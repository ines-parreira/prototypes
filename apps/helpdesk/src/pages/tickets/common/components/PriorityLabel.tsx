import { forwardRef, useImperativeHandle, useRef } from 'react'

import cn from 'classnames'
import _capitalize from 'lodash/capitalize'

import type { ColorType } from '@gorgias/axiom'
import { Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'
import type { TicketPriority } from '@gorgias/helpdesk-types'

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
    priority: TicketPriority
}

export const PriorityLabel = forwardRef<HTMLDivElement, PriorityLabelProps>(
    ({ className, displayLabel = true, hasTooltip = false, priority }, ref) => {
        const type = PRIORITY_TO_BADGE[priority] || 'modern'

        const elementRef = useRef<HTMLDivElement>(null)
        useImperativeHandle(ref, () => elementRef.current!)

        return (
            <>
                <Badge
                    ref={elementRef}
                    className={cn({ [css.badge]: !displayLabel }, className)}
                    type={type}
                >
                    <i className={cn(css.icon, css[priority])} />
                    {displayLabel && priority}
                </Badge>
                {hasTooltip && (
                    <Tooltip target={elementRef}>
                        {`Priority: ${_capitalize(priority)}`}
                    </Tooltip>
                )}
            </>
        )
    },
)
