import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './ChatIntegrationPreview.less'
import {getTextColorBasedOnBackground} from './color-utils'
import ConversationTimestamp from './ConversationTimestamp'

type Props = {
    conversationColor: string
    messages: ReactNode[]
    hideConversationTimestamp?: boolean
    language?: string
}

const CustomerInitialMessages = ({
    conversationColor,
    messages,
    hideConversationTimestamp,
    language,
}: Props) => {
    const contrastColor = getTextColorBasedOnBackground(conversationColor)
    return (
        <div className="d-flex flex-column">
            {!hideConversationTimestamp && (
                <ConversationTimestamp language={language} />
            )}

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
        </div>
    )
}

export default CustomerInitialMessages
