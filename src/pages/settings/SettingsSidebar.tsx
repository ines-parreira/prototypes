import React, { ReactNode } from 'react'

import classnames from 'classnames'

import css from './SettingsSidebar.less'

export default function SettingsSidebar({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}): JSX.Element {
    return (
        <div className={classnames(css.container, className)}>
            <div className={css.content}>{children}</div>
        </div>
    )
}
