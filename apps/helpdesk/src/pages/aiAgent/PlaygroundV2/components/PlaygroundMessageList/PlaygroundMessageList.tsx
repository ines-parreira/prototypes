import { useEffect, useRef } from 'react'

import classNames from 'classnames'

import { MessageType, PlaygroundMessage } from 'models/aiAgentPlayground/types'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'

import { AI_AGENT_SENDER } from '../../constants'
import KnowledgeSourcesWrapper from '../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'
import { PlaygroundReasoning } from '../PlaygroundReasoning/PlaygroundReasoning'

import css from '../../AiAgentPlayground.less'

type Props = {
    accountId: number
    userId: number
    onGuidanceClick?: (guidanceArticleId: number) => void
    shouldDisplayReasoning?: boolean
    messages: PlaygroundMessage[]
}

export const PlaygroundMessageList = ({
    messages,
    accountId,
    userId,
    onGuidanceClick,
    shouldDisplayReasoning = false,
}: Props) => {
    const messageContainerRef = useRef<HTMLDivElement>(null)

    const { storeConfiguration } = useConfigurationContext()
    const { channel } = useCoreContext()
    const { testSessionId } = useCoreContext()

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            messageContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }
    }, [messages])

    // Find ticket event message for outcome
    const ticketEventMessage = messages.find(
        (m) => m.type === MessageType.TICKET_EVENT,
    )
    const outcome =
        ticketEventMessage?.type === MessageType.TICKET_EVENT
            ? ticketEventMessage.outcome
            : undefined

    return (
        <div className={css.outputContainer}>
            <div
                className={classNames(css.outputInner, {
                    [css['outputInner--empty']]: messages.length === 0,
                })}
                ref={messageContainerRef}
            >
                {messages.map((message, index) => (
                    <PlaygroundMessageComponent
                        message={message}
                        channel={channel}
                        withAnimation
                        key={index}
                    >
                        {!shouldDisplayReasoning &&
                            message.type === MessageType.MESSAGE &&
                            message.executionId &&
                            storeConfiguration && (
                                <KnowledgeSourcesWrapper
                                    executionId={message.executionId}
                                    storeConfiguration={storeConfiguration}
                                    outcome={outcome}
                                    onGuidanceClick={onGuidanceClick}
                                />
                            )}
                        {shouldDisplayReasoning &&
                            testSessionId &&
                            message.type === MessageType.MESSAGE &&
                            message.sender === AI_AGENT_SENDER &&
                            message.isReasoningEligible && (
                                <PlaygroundReasoning
                                    testSessionId={testSessionId}
                                    messageId={message.id!}
                                    accountId={accountId}
                                    userId={userId}
                                />
                            )}
                    </PlaygroundMessageComponent>
                ))}
            </div>
        </div>
    )
}
