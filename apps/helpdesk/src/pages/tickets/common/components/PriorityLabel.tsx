import { forwardRef } from 'react'

import cn from 'classnames'

import { TicketPriority } from '@gorgias/helpdesk-types'
import { Badge, ColorType } from '@gorgias/merchant-ui-kit'

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
    priority: TicketPriority
}

export const PriorityLabel = forwardRef<HTMLDivElement, PriorityLabelProps>(
    ({ className, displayLabel = true, priority }, ref) => {
        const type = PRIORITY_TO_BADGE[priority] || 'modern'

        return (
            <Badge ref={ref} className={className} type={type}>
                <i className={cn(css.icon, css[priority])} />
                {displayLabel && priority}
            </Badge>
        )
    },
)
