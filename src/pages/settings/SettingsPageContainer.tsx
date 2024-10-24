import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './SettingsPageContainer.less'

export default function SettingsPageContainer({
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
