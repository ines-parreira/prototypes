import type { ReactNode } from 'react'

import { Card } from '@gorgias/axiom'

import css from './TicketTimelineWidget.less'

type TimelineCardProps = {
    children: ReactNode
    className?: string
    onClick?: () => void
}

export function TimelineCard({
    children,
    className,
    onClick,
}: TimelineCardProps) {
    return (
        <div onClick={onClick}>
            <Card
                className={`${css.card} ${className || ''}`}
                gap="xxxs"
                withHoverEffect
            >
                {children}
            </Card>
        </div>
    )
}
