import React from 'react'
import {Map} from 'immutable'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import CustomerInitialMessages from './CustomerInitialMessages'
import EmailCaptureMessage from './EmailCaptureMessage'
import AgentMessages from './AgentMessages'

import css from './ChatIntegrationPreview.less'

type Props = {
    currentUser: Map<any, any>
    conversationColor: string
    chatTitle: string
    avatar?: GorgiasChatAvatarSettings
    language?: string
}

const OptionalEmailCapture: React.FC<Props> = ({
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
export default OptionalEmailCapture
