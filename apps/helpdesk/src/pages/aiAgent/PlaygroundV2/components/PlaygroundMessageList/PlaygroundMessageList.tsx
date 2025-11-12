import React, { useEffect, useRef } from 'react'

import classNames from 'classnames'

import { MessageType } from 'models/aiAgentPlayground/types'
import { SmsChannelMessagesContainer } from 'pages/aiAgent/PlaygroundV2/components/SmsChannelMessagesContainer/SmsChannelMessagesContainer'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'

import { useMessagesContext } from '../../contexts/MessagesContext'
import KnowledgeSourcesWrapper from '../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper'
import { PlaygroundInitialContent } from '../PlaygroundInitialContent/PlaygroundInitialContent'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'

import css from '../../AiAgentPlayground.less'

type Props = {
    onGuidanceClick?: (guidanceArticleId: number) => void
}

const WrappedPlaygroundMessageList = ({ onGuidanceClick }: Props) => {
    const messageContainerRef = useRef<HTMLDivElement>(null)

    const { storeConfiguration } = useConfigurationContext()
    const { channel } = useCoreContext()
    const { messages } = useMessagesContext()

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
                            {message.type === MessageType.MESSAGE &&
                                message.executionId &&
                                storeConfiguration && (
                                    <KnowledgeSourcesWrapper
                                        executionId={message.executionId}
                                        storeConfiguration={storeConfiguration}
                                        outcome={outcome}
                                        onGuidanceClick={onGuidanceClick}
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
    const { shopName } = useConfigurationContext()
    const { mode } = useSettingsContext()
    if (mode === 'outbound') {
        return (
            <SmsChannelMessagesContainer storeName={shopName}>
                <WrappedPlaygroundMessageList {...props} />
            </SmsChannelMessagesContainer>
        )
    }
    return <WrappedPlaygroundMessageList />
}
