import React, { ReactNode, useMemo } from 'react'

import classnames from 'classnames'

import css from './DashboardGridCell.less'

type Props = {
    children: ReactNode
    className?: string
    size?: number
}

export default function DashboardGridCell({
    children,
    className,
    size = 12,
}: Props) {
    const style = useMemo(
        () => ({
            gridColumn: `span ${size} / span ${size}`,
        }),
        [size],
    )

    return (
        <div className={classnames(className, css.cell)} style={style}>
            {children}
        </div>
    )
}
