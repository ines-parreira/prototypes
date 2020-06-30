// @flow
import classnames from 'classnames'
import moment from 'moment'
import React from 'react'

import css from './ChatIntegrationPreview.less'

const MessageTimestamp = () => (
    <div className={classnames(css.messageTimestamp)}>
        <span>{moment().subtract(6, 'minute').fromNow()}. </span>
        <span className={classnames(css.messageStatus)}>Delivered</span>
    </div>
)

export default MessageTimestamp
