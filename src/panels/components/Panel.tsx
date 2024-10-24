import classNames from 'classnames'
import React, {ReactNode} from 'react'

import css from './Panel.less'

type Props = {
    children: ReactNode
    className?: string
    width?: number
}

export default function Panel({children, className, width}: Props) {
    return (
        <div className={classNames(css.panel, className)} style={{width}}>
            {children}
        </div>
    )
}
