import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import { BubbleActions } from './components/BubbleActions'

import css from './MessageBubble.less'

type MessageBubbleProps = {
    children?: ReactNode
    className?: string
    variant?: 'regular' | 'from-agent' | 'ai-agent' | 'internal-note'
    actions?: ReactNode
}

export function MessageBubble({
    className,
    children,
    variant = 'regular',
    actions,
}: MessageBubbleProps) {
    const actionsPlacement = variant === 'from-agent' ? 'left' : 'right'

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
            {actions && (
                <BubbleActions placement={actionsPlacement}>
                    {actions}
                </BubbleActions>
            )}
        </Box>
    )
}
