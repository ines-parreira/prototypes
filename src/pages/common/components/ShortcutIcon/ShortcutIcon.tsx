import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './ShortcutIcon.less'

type ShortcutIconType = 'classic' | 'dark'

type Props = {
    children: ReactNode
    className?: string
    type?: ShortcutIconType
}

const ShortcutIcon = ({children, className, type = 'classic'}: Props) => (
    <div className={classnames(css.wrapper, css[type], className)}>
        {children}
    </div>
)

export default ShortcutIcon
