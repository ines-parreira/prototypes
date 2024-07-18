import React, {ReactNode, useContext} from 'react'

import {EditionContext} from 'providers/infobar/EditionContext'

import css from './CardHeaderYotpoBadge.less'

type Props = {
    color?: string
    iconName: string
    className?: string
    children?: ReactNode
}

export function CardHeaderYotpoBadge({
    children,
    className,
    iconName,
    color = 'primary',
}: Props) {
    const {isEditing} = useContext(EditionContext)
    if (isEditing) return null
    return (
        <span className={`${className || ``} ${css.container} ${color}`}>
            <span className={`material-icons ${css.icon}`}>{iconName}</span>
            {children && <span className={css.children}>{children}</span>}
        </span>
    )
}
