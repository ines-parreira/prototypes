import type { Map } from 'immutable'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'

import AgentMessages from './AgentMessages'

type DisabledEmailCaptureMessageProps = {
    mainColor: string
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
    mainColor,
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
                    conversationColor={mainColor}
                    messages={[
                        {
                            content: translatedTexts.waitTimeShortEmailCaptured,
                            isHtml: false,
                            attachments: [],
                        },
                    ]}
                    language={language}
                />
            )}
        </>
    )
}

export default DisabledEmailCaptureMessage
