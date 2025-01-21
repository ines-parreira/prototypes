import React, {ReactNode} from 'react'

import css from './Pill.less'

export function Pill({
    color = 'blue',
    className,
    children,
}: {
    color?: 'blue' | 'grey'
    className?: string
    children: ReactNode
}) {
    return (
        <span
            className={`${css.pill} ${color === 'blue' ? css.blue : css.grey} ${className}`}
        >
            {children}
        </span>
    )
}
