import type { ReactNode } from 'react'
import React from 'react'

import classNames from 'classnames'

import css from './Panel.less'

type Props = {
    children: ReactNode
    className?: string
    width?: number
}

export default function Panel({ children, className, width }: Props) {
    return (
        <div className={classNames(css.panel, className)} style={{ width }}>
            {children}
        </div>
    )
}
