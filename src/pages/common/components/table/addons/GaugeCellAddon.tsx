import React from 'react'
import classNames from 'classnames'

import css from './GaugeCellAddon.less'

type Props = {
    className?: string
    style?: React.CSSProperties
    progress: number
    color?: string
}

export default function GaugeCellAddon({
    className,
    style,
    progress,
    color,
}: Props) {
    return (
        <div
            className={classNames(className, css.gaugeAddon)}
            style={
                {
                    backgroundColor: color,
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    ...style,
                } as React.CSSProperties
            }
        />
    )
}
