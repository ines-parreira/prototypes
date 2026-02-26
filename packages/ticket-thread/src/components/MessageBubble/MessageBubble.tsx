import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import css from './MessageBubble.less'

type MessageBubbleProps = {
    children?: ReactNode
    className?: string
}

export function MessageBubble({ className, children }: MessageBubbleProps) {
    return (
        <Box
            padding="md"
            className={cn(css.messageBubble, className)}
            flexGrow={1}
        >
            {children}
        </Box>
    )
}
