import type { MouseEvent, ReactNode } from 'react'

import { Card } from '@gorgias/axiom'

import css from './TicketTimelineWidget.less'

type TimelineCardProps = {
    children: ReactNode
    className?: string
    onClick?: () => void
    href?: string
}

export function TimelineCard({
    children,
    className,
    onClick,
    href,
}: TimelineCardProps) {
    if (href) {
        const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
            if (!event.metaKey && !event.ctrlKey) {
                event.preventDefault()
                onClick?.()
            }
        }
        return (
            <a className={css.cardLink} href={href} onClick={handleClick}>
                <Card
                    className={`${css.card} ${className || ''}`}
                    gap="xxxs"
                    withHoverEffect={!!onClick}
                >
                    {children}
                </Card>
            </a>
        )
    }

    return (
        <div onClick={onClick}>
            <Card
                className={`${css.card} ${className || ''}`}
                gap="xxxs"
                withHoverEffect={!!onClick}
            >
                {children}
            </Card>
        </div>
    )
}
