import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import css from './MessageBubble.less'

type MessageBubbleProps = {
    children?: ReactNode
    className?: string
    variant?: 'regular' | 'from-agent' | 'ai-agent' | 'internal-note'
}

export function MessageBubble({
    className,
    children,
    variant = 'regular',
}: MessageBubbleProps) {
    return (
        <Box
            data-variant={variant}
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
