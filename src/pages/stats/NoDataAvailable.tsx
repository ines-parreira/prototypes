import React from 'react'
import classnames from 'classnames'

import css from './NoDataAvailable.less'

type Props = {
    title?: string
    description?: string
    className?: string
    style?: React.CSSProperties
}

export function NoDataAvailable({
    title = 'No data available',
    description = 'Try adjusting filters to get results.',
    className,
    style,
}: Props) {
    return (
        <div className={classnames(css.noData, className)} style={style}>
            <p className={css.noDataTitle}>{title}</p>
            <p>{description}</p>
        </div>
    )
}
