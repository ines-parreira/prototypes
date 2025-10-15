import React, { useEffect, useRef } from 'react'

import classNames from 'classnames'

import { MessageType } from 'models/aiAgentPlayground/types'

import { usePlaygroundContext } from '../../contexts/PlaygroundContext'
import KnowledgeSourcesWrapper from '../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper'
import { PlaygroundInitialContent } from '../PlaygroundInitialContent/PlaygroundInitialContent'
import PlaygroundMessageComponent, {
    AI_AGENT_SENDER,
} from '../PlaygroundMessage/PlaygroundMessage'

import css from '../../AiAgentPlayground.less'

export const PlaygroundMessageList = () => {
    const messageContainerRef = useRef<HTMLDivElement>(null)

    const { uiState, channelState, messagesState, storeConfiguration } =
        usePlaygroundContext()
    const { channel } = channelState
    const { messages } = messagesState

    // Update isInitialMessage based on messages
    useEffect(() => {
        const isInitial =
            messages.filter((m) => m.sender !== AI_AGENT_SENDER).length === 0
        uiState.setIsInitialMessage(isInitial)
    }, [messages, uiState])

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

    if (!storeConfiguration) return null

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
                        <div key={index}>
                            <PlaygroundMessageComponent
                                message={message}
                                channel={channel}
                                withAnimation
                            >
                                {message.type === MessageType.MESSAGE &&
                                    message.executionId && (
                                        <KnowledgeSourcesWrapper
                                            executionId={message.executionId}
                                            storeConfiguration={
                                                storeConfiguration
                                            }
                                            outcome={outcome}
                                        />
                                    )}
                            </PlaygroundMessageComponent>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
