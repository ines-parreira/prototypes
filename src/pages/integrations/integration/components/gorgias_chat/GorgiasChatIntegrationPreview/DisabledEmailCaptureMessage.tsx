import React from 'react'
import {Map} from 'immutable'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {GorgiasChatAvatarSettings} from 'models/integration/types'

import AgentMessages from './AgentMessages'

type DisabledEmailCaptureMessageProps = {
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    currentUser?: Map<any, any>
    language?: string
}

const DisabledEmailCaptureMessage = ({
    avatar,
    chatTitle,
    currentUser,
    language,
}: DisabledEmailCaptureMessageProps) => {
    const translatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <>
            {currentUser && (
                <AgentMessages
                    avatar={avatar}
                    chatTitle={chatTitle}
                    currentUser={currentUser}
                    messages={[
                        {
                            content: translatedTexts.waitTimeShortEmailCaptured,
                            isHtml: false,
                            attachments: [],
                        },
                    ]}
                />
            )}
        </>
    )
}

export default DisabledEmailCaptureMessage
