import type { ReactNode } from 'react'

import cn from 'classnames'

import css from '../MessageBubble.less'

type BubbleActionsProps = {
    children: ReactNode
    placement: 'left' | 'right'
}

export function BubbleActions({ children, placement }: BubbleActionsProps) {
    return (
        <div
            className={cn(
                css.bubbleActions,
                placement === 'left'
                    ? css.bubbleActionsLeft
                    : css.bubbleActionsRight,
            )}
        >
            {children}
        </div>
    )
}
