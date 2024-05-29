import React from 'react'
import classNames from 'classnames'

import css from './AIBanner.less'

const AIBanner: React.FC = ({children}) => {
    return (
        <div className={css.container}>
            <i className={classNames('material-icons', css.icon)}>
                auto_awesome
            </i>
            <div className={css.content}>{children}</div>
        </div>
    )
}

export default AIBanner
