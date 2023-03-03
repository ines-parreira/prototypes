import React from 'react'
import {Map} from 'immutable'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import css from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreview.less'

import CustomerInitialMessages from '../../GorgiasChatIntegrationPreview/CustomerInitialMessages'
import EmailCaptureMessage from '../../GorgiasChatIntegrationPreview/EmailCaptureMessage'
import AgentMessages from '../../GorgiasChatIntegrationPreview/AgentMessages'

type Props = {
    currentUser: Map<any, any>
    conversationColor: string
    chatTitle: string
    avatar?: GorgiasChatAvatarSettings
    language?: string
}

const AppearanceMessages: React.FC<Props> = ({
    currentUser,
    conversationColor,
    chatTitle,
    avatar,
    language,
}) => (
    <div className={css.content}>
        <CustomerInitialMessages
            conversationColor={conversationColor}
            messages={["Hi, what's my order status?"]}
            hideMessageTimestamp={true}
        />
        <EmailCaptureMessage
            className="my-3"
            conversationColor={conversationColor}
            name={chatTitle}
            hideMessageTimestamp={false}
            language={language}
        />
        <AgentMessages
            currentUser={currentUser}
            messages={[
                {
                    content:
                        "Hello! I'll check it for you, what's your order number?",
                    isHtml: false,
                    attachments: [],
                },
            ]}
            chatTitle={chatTitle}
            avatar={avatar}
        />
    </div>
)
export default AppearanceMessages
