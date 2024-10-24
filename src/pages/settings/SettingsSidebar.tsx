import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './SettingsSidebar.less'

export default function SettingsSidebar({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}): JSX.Element {
    return (
        <div className={classnames(css.container, className)}>{children}</div>
    )
}
