import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './ChatIntegrationPreview.less'
import {getTextColorBasedOnBackground} from './color-utils'
import ConversationTimestamp from './ConversationTimestamp'
import MessageTimestamp from './MessageTimestamp'

type Props = {
    conversationColor: string
    messages: ReactNode[]
    hideConversationTimestamp?: boolean
    hideMessageTimestamp?: boolean
}

const CustomerInitialMessages = ({
    conversationColor,
    messages,
    hideConversationTimestamp,
    hideMessageTimestamp,
}: Props) => {
    const contrastColor = getTextColorBasedOnBackground(conversationColor)
    return (
        <div>
            {!hideConversationTimestamp && <ConversationTimestamp />}

            {messages.map((message, index) => (
                <div
                    className={classnames(
                        css.bubble,
                        css.primary,
                        index === 0 ? css.firstMessageOfAppUser : null,
                        index === messages.length - 1 ? css.lastMessage : null
                    )}
                    key={index}
                    style={{
                        backgroundColor: conversationColor,
                        color: contrastColor,
                    }}
                >
                    {message}
                </div>
            ))}

            {!hideMessageTimestamp && <MessageTimestamp />}
        </div>
    )
}

export default CustomerInitialMessages
