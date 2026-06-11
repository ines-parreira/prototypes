import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import css from './SettingsContent.less'

export function SettingsContent({
    children,
    className,
    fullWidth = false,
}: {
    children: ReactNode
    className?: string
    fullWidth?: boolean
}): JSX.Element {
    return (
        <div
            className={classnames(css.container, className, {
                [css.fullWidth]: fullWidth,
            })}
        >
            {children}
        </div>
    )
}
