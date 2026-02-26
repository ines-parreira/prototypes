import type { Map } from 'immutable'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'

import AgentMessages from './AgentMessages'
import AutoResponder from './AutoResponder'
import CustomerInitialMessages from './CustomerInitialMessages'

type Props = {
    conversationColor: string
    chatTitle?: string
    language?: string
    autoResponderReply?: string
    avatar?: GorgiasChatAvatarSettings
    currentUser?: Map<any, any>
    isEmailCaptureEnabled?: boolean
}

const AutoResponderMessages: React.FC<Props> = ({
    currentUser,
    avatar,
    conversationColor,
    chatTitle,
    language,
    autoResponderReply,
    isEmailCaptureEnabled,
}) => {
    const widgetTranslatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <>
            <CustomerInitialMessages
                conversationColor={conversationColor}
                messages={[widgetTranslatedTexts.previewCustomerInitialMessage]}
            />
            <AutoResponder
                chatTitle={chatTitle}
                language={language}
                autoResponderReply={autoResponderReply}
                isEmailCaptureEnabled={isEmailCaptureEnabled}
            />
            {currentUser && (
                <AgentMessages
                    currentUser={currentUser}
                    conversationColor={conversationColor}
                    messages={[
                        {
                            content:
                                widgetTranslatedTexts.previewAgentInitialMessage,
                            isHtml: false,
                            attachments: [],
                        },
                    ]}
                    chatTitle={chatTitle}
                    avatar={avatar}
                    language={language}
                />
            )}
        </>
    )
}

export default AutoResponderMessages
