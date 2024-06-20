import React from 'react'
import classNames from 'classnames'

import css from './AIBanner.less'

type Props = {
    className?: string
    hasError?: boolean
}

const AIBanner: React.FC<Props> = ({children, className, hasError}) => {
    return (
        <div
            data-testid="ai-banner"
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
