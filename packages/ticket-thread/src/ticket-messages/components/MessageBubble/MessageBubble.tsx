import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import type { TicketThreadPendingState } from '#ticket-messages/types'

import css from './MessageBubble.less'

type MessageBubbleProps = {
    children?: ReactNode
    className?: string
    variant?:
        | 'regular'
        | 'from-agent'
        | 'ai-agent'
        | 'ai-agent-handover'
        | 'internal-note'
    pendingState?: TicketThreadPendingState
    isGroupedMessage?: boolean
}

export function MessageBubble({
    className,
    children,
    variant = 'regular',
    pendingState,
    isGroupedMessage = false,
}: MessageBubbleProps) {
    return (
        <Box
            data-pending-state={pendingState}
            data-variant={variant}
            data-hover-state={!isGroupedMessage}
            padding="md"
            className={cn(css.messageBubble, className)}
            width="100%"
            flexDirection="column"
            gap="xs"
        >
            {children}
        </Box>
    )
}
