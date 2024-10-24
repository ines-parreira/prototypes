import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './ShortcutIcon.less'

type ShortcutIconType = 'classic' | 'dark'

type Props = {
    children: ReactNode
    className?: string
    type?: ShortcutIconType
    fillStyle?: 'fill' | 'ghost'
}

const ShortcutIcon = ({
    children,
    className,
    fillStyle = 'fill',
    type = 'classic',
}: Props) => (
    <div
        className={classnames(
            css.wrapper,
            {[css[type]]: fillStyle === 'fill'},
            className
        )}
    >
        {children}
    </div>
)

export default ShortcutIcon
