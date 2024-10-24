import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './SettingsContent.less'

export default function SettingsContent({
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
