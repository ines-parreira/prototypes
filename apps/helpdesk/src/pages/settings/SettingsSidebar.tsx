import React, { ReactNode } from 'react'

import classnames from 'classnames'

import css from './SettingsSidebar.less'

export default function SettingsSidebar({
    children,
    className,
    contentTakeFullWidth = true,
}: {
    children: ReactNode
    className?: string
    contentTakeFullWidth?: boolean
}): JSX.Element {
    return (
        <div className={classnames(css.container, className)}>
            <div
                className={classnames({ [css.content]: contentTakeFullWidth })}
            >
                {children}
            </div>
        </div>
    )
}
