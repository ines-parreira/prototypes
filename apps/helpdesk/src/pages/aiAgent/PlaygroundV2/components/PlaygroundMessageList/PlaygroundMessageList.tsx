import { useEffect, useRef } from 'react'

import classNames from 'classnames'

import { MessageType } from 'models/aiAgentPlayground/types'
import { PlaygroundOutboundMessageList } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundOutboundMessageList/PlaygroundOutboundMessageList'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'

import { AI_AGENT_SENDER } from '../../constants'
import { useMessagesContext } from '../../contexts/MessagesContext'
import KnowledgeSourcesWrapper from '../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper'
import { PlaygroundInitialContent } from '../PlaygroundInitialContent/PlaygroundInitialContent'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'
import { PlaygroundReasoning } from '../PlaygroundReasoning/PlaygroundReasoning'

import css from '../../AiAgentPlayground.less'

type Props = {
    accountId: number
    userId: number
    onGuidanceClick?: (guidanceArticleId: number) => void
    shouldDisplayReasoning?: boolean
}

const WrappedPlaygroundMessageList = ({
    accountId,
    userId,
    onGuidanceClick,
    shouldDisplayReasoning = false,
}: Props) => {
    const messageContainerRef = useRef<HTMLDivElement>(null)

    const { storeConfiguration } = useConfigurationContext()
    const { channel } = useCoreContext()
    const { messages } = useMessagesContext()
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
                {messages.length === 0 ? (
                    <PlaygroundInitialContent />
                ) : (
                    messages.map((message, index) => (
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
                                message.type === MessageType.MESSAGE &&
                                message.sender === AI_AGENT_SENDER &&
                                testSessionId && (
                                    <PlaygroundReasoning
                                        testSessionId={testSessionId}
                                        messageId={message.id!}
                                        accountId={accountId}
                                        userId={userId}
                                    />
                                )}
                        </PlaygroundMessageComponent>
                    ))
                )}
            </div>
        </div>
    )
}

export const PlaygroundMessageList = (props: Props) => {
    const { mode } = useSettingsContext()

    if (mode === 'outbound') {
        return (
            <PlaygroundOutboundMessageList>
                <WrappedPlaygroundMessageList {...props} />
            </PlaygroundOutboundMessageList>
        )
    }
    return <WrappedPlaygroundMessageList {...props} />
}
