import React, {useEffect, useRef} from 'react'

import {
    AccountConfigurationWithHttpIntegration,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {MessageType} from 'models/aiAgentPlayground/types'
import {PlaygroundInputSection} from '../PlaygroundInputSection/PlaygroundInputSection'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'
import {usePlaygroundForm} from '../../hooks/usePlaygroundForm'
import {usePlaygroundMessages} from '../../hooks/usePlaygroundMessages'
import TicketEvent from '../TicketEvent/TicketEvent'
import {PlaygroundChatEmptyBanner} from './PlaygroundChatEmptyBanner'

import css from './PlaygroundChat.less'

type Props = {
    storeData: StoreConfiguration
    accountData: AccountConfigurationWithHttpIntegration
}

export const PlaygroundChat = ({storeData, accountData}: Props) => {
    const messageContainerRef = useRef<HTMLDivElement>(null)
    const {messages, onMessageSend, onNewConversation, isMessageSending} =
        usePlaygroundMessages({
            storeData,
            httpIntegrationId: accountData.httpIntegration?.id,
            gorgiasDomain: accountData.gorgiasDomain,
            accountId: accountData.accountId,
        })

    const {
        formValues,
        onFormValuesChange,
        isDisabled,
        disabledMessage,
        isFormValid,
    } = usePlaygroundForm({
        helpCenterId: storeData.helpCenterId,
        shopName: storeData.storeName,
        snippetHelpCenterId: storeData.snippetHelpCenterId,
    })

    const onSendMessage = () => {
        if (!isFormValid) {
            return
        }

        void onMessageSend(formValues)

        onFormValuesChange('message', '')
    }

    useEffect(() => {
        if (messages.length > 0) {
            messageContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }
    }, [messages])

    return (
        <div className={css.container}>
            <div className={css.outputContainer}>
                <div className={css.outputInner} ref={messageContainerRef}>
                    {messages.length === 0 ? (
                        <div className={css.emptyState}>
                            <PlaygroundChatEmptyBanner />
                        </div>
                    ) : (
                        messages.map((message, index) =>
                            message.type === MessageType.TICKET_EVENT &&
                            message.outcome ? (
                                <TicketEvent
                                    key={index}
                                    type={message.outcome}
                                />
                            ) : (
                                <PlaygroundMessageComponent
                                    sender={message.sender}
                                    type={message.type}
                                    message={message.message}
                                    createdDatetime={message.createdDatetime}
                                    key={index}
                                    withAnimation
                                />
                            )
                        )
                    )}
                </div>
            </div>
            <div className={css.inputContainer}>
                <PlaygroundInputSection
                    formValues={formValues}
                    onFormValuesChange={onFormValuesChange}
                    isDisabled={isDisabled || isMessageSending}
                    disabledMessage={disabledMessage}
                    isInitialMessage={messages.length === 0}
                    onSendMessage={onSendMessage}
                    onNewConversation={onNewConversation}
                />
            </div>
        </div>
    )
}
