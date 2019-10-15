// @flow
import classnames from 'classnames'
import React from 'react'

import css from './ChatIntegrationPreview.less'
import ConversationTimestamp from './ConversationTimestamp'
import MessageTimestamp from './MessageTimestamp'

type Props = {
    conversationColor: string,
    messages: string[],
}

const CustomerInitialMessages = (props: Props) => (
    <div>
        <ConversationTimestamp />

        {props.messages.map((message, index) => (
            <div
                className={classnames(
                    css.bubble,
                    css.primary,
                    index === 0 ? css.firstMessageOfAppUser : null,
                    index === props.messages.length - 1 ? css.lastMessage : null
                )}
                key={`${message}-${index}`}
                style={{backgroundColor: props.conversationColor}}
            >
                {message}
            </div>
        ))}

        <MessageTimestamp />
    </div>
)

export default CustomerInitialMessages
