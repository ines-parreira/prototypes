import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import { getTextColorBasedOnBackground } from './color-utils'
import ConversationTimestamp from './ConversationTimestamp'

import css from './ChatIntegrationPreview.less'

type Props = {
    conversationColor: string
    messages: ReactNode[]
    hideConversationTimestamp?: boolean
}

const CustomerInitialMessages = ({
    conversationColor,
    messages,
    hideConversationTimestamp,
}: Props) => {
    const contrastColor = getTextColorBasedOnBackground(conversationColor)
    return (
        <div className="d-flex flex-column">
            {!hideConversationTimestamp && <ConversationTimestamp />}

            {messages.map((message, index) => (
                <div
                    className={classnames(
                        css.bubble,
                        css.primary,
                        index === 0 ? css.firstMessageOfAppUser : null,
                        index === messages.length - 1 ? css.lastMessage : null,
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
