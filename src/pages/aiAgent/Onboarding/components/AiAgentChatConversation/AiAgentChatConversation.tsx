import classnames from 'classnames'
import {Map} from 'immutable'
import React, {FC, Ref} from 'react'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import AgentMessages from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/AgentMessages'
import CustomerInitialMessages from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/CustomerInitialMessages'

import css from './AiAgentChatConversation.less'

type ConversationMessage = {
    content: string
    isHtml: boolean
    fromAgent: boolean
    attachments: ProductCardAttachment[]
}

type Props = {
    className?: string
    innerRef?: Ref<HTMLDivElement>
    conversationColor: string
    messages: ConversationMessage[]
    chatTitle?: string
    avatar?: GorgiasChatAvatarSettings
    language?: string
    user: Map<any, any>
}

const AiAgentChatConversation: FC<Props> = ({
    className,
    innerRef,
    conversationColor,
    avatar,
    language,
    user,
    messages,
}) => {
    // group messages by fromAgent but create a new group when fromAgent changes
    const groupedMessages = messages.reduce(
        (acc, message) => {
            const lastGroup = acc[acc.length - 1]
            if (lastGroup && lastGroup.fromAgent === message.fromAgent) {
                lastGroup.messages.push(message)
            } else {
                acc.push({fromAgent: message.fromAgent, messages: [message]})
            }
            return acc
        },
        [] as {fromAgent: boolean; messages: ConversationMessage[]}[]
    )

    return (
        <div ref={innerRef} className={classnames(css.content, className)}>
            {groupedMessages.map(({fromAgent, messages}, index) =>
                fromAgent ? (
                    <AgentMessages
                        key={index}
                        currentUser={user}
                        messages={messages}
                        chatTitle={user.get('name')}
                        avatar={avatar}
                        language={language}
                        conversationColor={conversationColor}
                        backgroundColor="#FFFFFF"
                    />
                ) : (
                    <CustomerInitialMessages
                        key={index}
                        conversationColor={conversationColor}
                        messages={messages.map((message) => message.content)}
                        hideConversationTimestamp={true}
                    />
                )
            )}
        </div>
    )
}

export default AiAgentChatConversation
