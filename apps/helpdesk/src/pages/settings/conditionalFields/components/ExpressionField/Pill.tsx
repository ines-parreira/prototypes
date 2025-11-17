import type { ReactNode } from 'react'
import React from 'react'

import css from './Pill.less'

export function Pill({
    color = 'secondary',
    className,
    children,
}: {
    color?: 'secondary' | 'light'
    className?: string
    children: ReactNode
}) {
    return (
        <span
            className={`${css.pill} ${color === 'secondary' ? css.secondary : css.light} ${className}`}
        >
            {children}
        </span>
    )
}
