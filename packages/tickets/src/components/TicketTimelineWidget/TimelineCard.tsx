import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

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
    const content = (
        <Box
            display="inline-block"
            width="100%"
            marginBottom="xs"
            paddingTop="sm"
            paddingBottom="sm"
            paddingLeft="md"
            paddingRight="md"
            className={`${css.card} ${className || ''}`}
        >
            {children}
        </Box>
    )

    if (onClick) {
        return (
            <div onClick={onClick} style={{ cursor: 'pointer' }}>
                {content}
            </div>
        )
    }

    return content
}
