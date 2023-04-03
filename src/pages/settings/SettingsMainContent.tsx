import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './settings.less'

export default function SettingsContent({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}): JSX.Element {
    return (
        <div className={classnames(css.contentWrapper, className)}>
            {children}
        </div>
    )
}
