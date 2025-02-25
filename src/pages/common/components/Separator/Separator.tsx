import React from 'react'

import classNames from 'classnames'

import styles from './Separator.less'

interface SeparatorProps {
    direction?: 'horizontal' | 'vertical'
    variant?: 'solid' | 'dashed'
    className?: string
}

export function Separator({
    direction = 'horizontal',
    variant = 'solid',
    className,
}: SeparatorProps) {
    return (
        <div
            className={classNames(
                styles.component,
                styles[direction],
                variant === 'dashed' && styles.dashed,
                className,
            )}
        />
    )
}
