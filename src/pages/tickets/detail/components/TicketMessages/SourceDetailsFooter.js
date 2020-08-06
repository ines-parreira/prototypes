//@flow
import classnames from 'classnames'
import React from 'react'

import type {TicketMessage} from '../../../../../models/ticket'

import SourceActionsFooter from './SourceActionsFooter'
import css from './SourceDetails.less'

type Props = {
    message: TicketMessage,
    className?: string,
    isMessageHidden: boolean,
}

export default function SourceDetailsFooter(props: Props) {
    const {message, isMessageHidden} = props
    return (
        <div className={classnames(css.wrapper, props.className)}>
            <SourceActionsFooter
                source={message.source}
                meta={message.meta}
                integrationId={message.integration_id}
                messageId={message.message_id}
                isMessageHidden={isMessageHidden}
            />
        </div>
    )
}
