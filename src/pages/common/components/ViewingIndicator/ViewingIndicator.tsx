import React from 'react'

import classnames from 'classnames'

import css from './ViewingIndicator.less'

type ViewingIndicatorProps = {
    title: string
    position?: 'left' | 'right'
    className?: string
}

export default function ViewingIndicator({
    title,
    position = 'left',
    className,
}: ViewingIndicatorProps) {
    return (
        <div
            className={classnames(
                css.viewers,
                {
                    [css.right]: position === 'right',
                },
                className,
            )}
            title={title}
        >
            <i className="material-icons">remove_red_eye</i>
        </div>
    )
}
