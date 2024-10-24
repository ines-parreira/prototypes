import classNames from 'classnames'
import React, {FC} from 'react'

import css from './AIBanner.less'

export type Props = {
    className?: string
    hasError?: boolean
}

const AIBanner: FC<Props> = ({children, className, hasError}) => {
    return (
        <div
            className={classNames(css.container, className, {
                [css.hasError]: hasError,
            })}
        >
            <i className={classNames('material-icons', css.icon)}>
                {hasError ? 'error' : 'auto_awesome'}
            </i>
            <div className={css.content}>{children}</div>
        </div>
    )
}

export default AIBanner
