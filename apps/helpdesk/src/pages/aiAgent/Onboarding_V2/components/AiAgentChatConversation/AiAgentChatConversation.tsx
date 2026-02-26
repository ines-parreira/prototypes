import type { FC, Ref } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'

import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import { GorgiasChatAvatarNameType } from 'models/integration/types'
import TypingMessage from 'pages/aiAgent/Onboarding_V2/components/TypingMessage/TypingMessage'
import { removeATags } from 'pages/aiAgent/utils/removeATags'
import type { ProductCardAttachment } from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import AgentMessages from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/AgentMessages'
import CustomerInitialMessages from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/CustomerInitialMessages'

import css from './AiAgentChatConversation.less'

export type ConversationMessage = {
    id?: string
    content: string
    isHtml: boolean
    fromAgent: boolean
    attachments: ProductCardAttachment[]
}

type Props = {
    className?: string
    innerRef?: Ref<HTMLDivElement>
    conversationColor: string
    messages?: ConversationMessage[]
    chatTitle?: string
    avatar?: GorgiasChatAvatarSettings
    language?: string
    user: Map<any, any>
    removeLinksFromMessages?: boolean
    isTyping?: boolean
}

const AiAgentChatConversation: FC<Props> = ({
    className,
    innerRef,
    conversationColor,
    avatar,
    language,
    user,
    messages,
    removeLinksFromMessages,
    isTyping = false,
}) => {
    const [, setIdx] = useState(0)
    const sanitizedMessage = useMemo(() => {
        if (!messages) return []

        if (removeLinksFromMessages) {
            return messages.map((message) => {
                return {
                    ...message,
                    content: message.isHtml
                        ? removeATags(message.content)
                        : message.content,
                }
            })
        }
        return messages
    }, [removeLinksFromMessages, messages])

    const aiAgentAvatar = {
        ...avatar,
        nameType: GorgiasChatAvatarNameType.CHAT_TITLE,
    } as GorgiasChatAvatarSettings

    // group messages by fromAgent but create a new group when fromAgent changes
    const groupedMessages = useMemo(() => {
        return sanitizedMessage.reduce(
            (acc, message) => {
                const lastGroup = acc[acc.length - 1]
                if (lastGroup && lastGroup.fromAgent === message.fromAgent) {
                    lastGroup.messages.push(message)
                } else {
                    acc.push({
                        fromAgent: message.fromAgent,
                        messages: [message],
                    })
                }
                return acc
            },
            [] as { fromAgent: boolean; messages: ConversationMessage[] }[],
        )
    }, [sanitizedMessage])

    const content = useRef<any>(null)
    let addMessage: NodeJS.Timeout | null = null

    const showMessages = useCallback(
        (newMessages: HTMLElement[]) => {
            addMessage = setInterval(() => {
                setIdx((prev) => {
                    if (prev < groupedMessages.length) {
                        newMessages[prev].classList.add(css.active)
                        newMessages[prev].scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                        })
                        return prev + 1
                    }

                    if (addMessage) {
                        clearInterval(addMessage)
                    }

                    return prev
                })
            }, 600)
        },
        [groupedMessages, addMessage],
    )

    const resetMessages = (newMessages: HTMLElement[]) => {
        newMessages.forEach((message: any) =>
            message.classList.remove(css.active),
        )
        setIdx(0)
    }

    useEffect(() => {
        if (isTyping) return

        const newMessages: HTMLElement[] = Array.from(content.current?.children)

        resetMessages(newMessages)
        showMessages(newMessages)

        return () => {
            if (addMessage) {
                clearInterval(addMessage)
            }
        }
    }, [groupedMessages, showMessages, addMessage, isTyping])

    return (
        <div ref={innerRef} className={classnames(css.content, className)}>
            <div ref={content} className={css.messages}>
                {groupedMessages.map(({ fromAgent, messages }, index) =>
                    fromAgent ? (
                        <div
                            key={`agent-message-${index}`}
                            className={classnames(
                                css.agentMessage,
                                css.message,
                            )}
                        >
                            <AgentMessages
                                currentUser={user}
                                messages={messages}
                                chatTitle={user.get('name')}
                                avatar={aiAgentAvatar}
                                language={language}
                                conversationColor={conversationColor}
                                backgroundColor="#FFFFFF"
                            />
                        </div>
                    ) : (
                        <div
                            key={`customer-message-${index}`}
                            className={classnames(
                                css.customerMessage,
                                css.message,
                            )}
                        >
                            <CustomerInitialMessages
                                conversationColor={conversationColor}
                                messages={messages.map(
                                    (message: ConversationMessage) =>
                                        message.content,
                                )}
                                hideConversationTimestamp={true}
                            />
                        </div>
                    ),
                )}

                {isTyping && (
                    <div
                        className={classnames(
                            css.active,
                            css.agentMessage,
                            css.message,
                        )}
                    >
                        <TypingMessage color={conversationColor} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default AiAgentChatConversation
