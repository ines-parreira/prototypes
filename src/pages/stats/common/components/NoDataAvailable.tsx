import { CSSProperties } from 'react'

import classnames from 'classnames'

import css from 'pages/stats/common/components/NoDataAvailable.less'

type Props = {
    title?: string
    description?: string
    className?: string
    style?: CSSProperties
}

export const NO_DATA_AVAILABLE_COMPONENT_TITLE = 'No data available'
export const NO_DATA_AVAILABLE_COMPONENT_TEXT =
    'Try adjusting filters to get results.'

export function NoDataAvailable({
    title = NO_DATA_AVAILABLE_COMPONENT_TITLE,
    description = NO_DATA_AVAILABLE_COMPONENT_TEXT,
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
