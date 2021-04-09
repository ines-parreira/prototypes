import React, {ReactNode} from 'react'

import css from './CardHeaderBadge.less'

type Props = {
    color?: string
    iconName: string
    className?: string
    children?: ReactNode
}

export function CardHeaderBadge({
    children,
    className,
    iconName,
    color = 'primary',
}: Props) {
    return (
        <span className={`${className || ``} ${css.container} ${color}`}>
            <span className={`material-icons ${css.icon}`}>{iconName}</span>
            {children && <span className={css.children}>{children}</span>}
        </span>
    )
}
