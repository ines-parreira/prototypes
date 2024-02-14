import React, {FC, ReactNode, Ref} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import AgentMessages, {AgentMessage} from './AgentMessages'
import CustomerInitialMessages from './CustomerInitialMessages'

import css from './ChatIntegrationPreview.less'

type Props = {
    className?: string
    innerRef?: Ref<HTMLDivElement>
    conversationColor: string
    currentUser?: Map<any, any>
    customerInitialMessages: ReactNode[]
    agentMessages: AgentMessage[]
    hideConversationTimestamp?: boolean
    enableAgentMessagesAnimations?: boolean
    chatTitle?: string
    avatar?: GorgiasChatAvatarSettings
    language?: string
}

const MessageContent: FC<Props> = ({
    className,
    innerRef,
    conversationColor,
    currentUser,
    customerInitialMessages,
    agentMessages,
    hideConversationTimestamp,
    enableAgentMessagesAnimations,
    children,
    chatTitle,
    avatar,
    language,
}) =>
    currentUser ? (
        <div ref={innerRef} className={classnames(css.content, className)}>
            <CustomerInitialMessages
                conversationColor={conversationColor}
                messages={customerInitialMessages}
                hideConversationTimestamp={hideConversationTimestamp}
            />

            {agentMessages.length > 0 && (
                <AgentMessages
                    currentUser={currentUser}
                    messages={agentMessages}
                    enableAgentMessagesAnimations={
                        enableAgentMessagesAnimations
                    }
                    chatTitle={chatTitle}
                    avatar={avatar}
                    language={language}
                />
            )}

            {children}
        </div>
    ) : null

export default MessageContent
