// @flow
import classnames from 'classnames'
import moment from 'moment'
import React from 'react'

import css from './ChatIntegrationPreview.less'

const ConversationTimestamp = () => (
    <div className={classnames(css.conversationTimestamp)}>
        {moment().format('MMMM D')}
    </div>
)

export default ConversationTimestamp
