import React from 'react'

import classnames from 'classnames'

import css from './EmptyResponseMessageContentError.less'

const EmptyResponseMessageContentError = () => {
    return (
        <div className={css.container}>
            <i className={classnames('material-icons', css.icon)}>error</i>
            <div className={css.message}>No response configured</div>
        </div>
    )
}

export default EmptyResponseMessageContentError
