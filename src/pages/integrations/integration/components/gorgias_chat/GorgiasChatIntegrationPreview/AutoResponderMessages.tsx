import React from 'react'
import {Map} from 'immutable'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

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
}

const AutoResponderMessages: React.FC<Props> = ({
    currentUser,
    avatar,
    conversationColor,
    chatTitle,
    language,
    autoResponderReply,
}) => (
    <>
        <CustomerInitialMessages
            conversationColor={conversationColor}
            messages={['Hi, could you give me an update on my order status?']}
        />
        <AutoResponder
            conversationColor={conversationColor}
            chatTitle={chatTitle}
            language={language}
            autoResponderReply={autoResponderReply}
        />
        {currentUser && (
            <AgentMessages
                currentUser={currentUser}
                messages={[
                    {
                        content:
                            "Hi there, thanks for your patience! Sure, let me check. What's your order number?",
                        isHtml: false,
                        attachments: [],
                    },
                ]}
                chatTitle={chatTitle}
                avatar={avatar}
            />
        )}
    </>
)

export default AutoResponderMessages
