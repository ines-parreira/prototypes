import classnames from 'classnames'
import {Map} from 'immutable'
import React, {Component, ReactNode, Ref} from 'react'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import css from './ChatIntegrationPreview.less'
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
    hideMessageTimestamp?: boolean
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
            hideMessageTimestamp,
            enableAgentMessagesAnimations,
            children,
            chatTitle,
            avatar,
        } = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div ref={innerRef} className={classnames(css.content, className)}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={customerInitialMessages}
                    hideConversationTimestamp={hideConversationTimestamp}
                    hideMessageTimestamp={hideMessageTimestamp}
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
