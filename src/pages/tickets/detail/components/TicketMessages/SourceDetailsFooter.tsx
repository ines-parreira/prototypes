import classnames from 'classnames'
import React from 'react'

import {TicketMessage} from '../../../../../models/ticket/types'

import SourceActionsFooter from './SourceActionsFooter'
import css from './SourceDetails.less'

type Props = {
    message: TicketMessage
    className?: string
    isMessageHidden: boolean
    isMessageDeleted: boolean
}

export default function SourceDetailsFooter(props: Props) {
    const {message, isMessageHidden, isMessageDeleted} = props
    return (
        <div className={classnames(css.wrapper, props.className)}>
            <SourceActionsFooter
                source={message.source}
                meta={message.meta}
                integrationId={message.integration_id}
                messageId={message.message_id}
                isMessageHidden={isMessageHidden}
                isMessageDeleted={isMessageDeleted}
            />
        </div>
    )
}
