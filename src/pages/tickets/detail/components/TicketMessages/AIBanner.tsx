import React from 'react'
import classNames from 'classnames'

import css from './AIBanner.less'

type Props = {
    className?: string
}

const AIBanner: React.FC<Props> = ({children, className}) => {
    return (
        <div className={classNames(css.container, className)}>
            <i className={classNames('material-icons', css.icon)}>
                auto_awesome
            </i>
            <div className={css.content}>{children}</div>
        </div>
    )
}

export default AIBanner
