import {Map} from 'immutable'
import React, {Component, ReactNode, Ref} from 'react'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import CustomerInitialMessages from './CustomerInitialMessages'

import AgentMessages, {AgentMessage} from './AgentMessages'

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
}

export default class MessageContent extends Component<Props> {
    render() {
        const {
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
        } = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div ref={innerRef} className={className}>
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
                    />
                )}

                {children}
            </div>
        )
    }
}
