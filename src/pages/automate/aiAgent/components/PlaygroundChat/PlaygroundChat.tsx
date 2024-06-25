import React, {useEffect, useRef, useState} from 'react'

import {StoreConfiguration} from 'models/aiAgent/types'
import {MessageType, PlaygroundMessage} from 'models/aiAgentPlayground/types'
import {PlaygroundInputSection} from '../PlaygroundInputSection/PlaygroundInputSection'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'
import {usePlaygroundForm} from '../../hooks/usePlaygroundForm'
import {CustomerHttpIntegrationDataMock} from '../../constants'
import {PlaygroundChatEmptyBanner} from './PlaygroundChatEmptyBanner'
import {PlaygroundFormValues} from './PlaygroundChat.types'

import css from './PlaygroundChat.less'

const mapFormValuesToMessage = (
    formValues: PlaygroundFormValues
): PlaygroundMessage => {
    return {
        sender:
            formValues.customerEmail ?? CustomerHttpIntegrationDataMock.address,
        type: MessageType.MESSAGE,
        message: formValues.message,
    }
}

type Props = {
    storeData: StoreConfiguration
}

export const PlaygroundChat = ({storeData}: Props) => {
    const messageContainerRef = useRef<HTMLDivElement>(null)
    // Fake messages for now
    const [messages, setMessages] = useState<PlaygroundMessage[]>([])

    const {
        formValues,
        onFormValuesChange,
        isDisabled,
        disabledMessage,
        isFormValid,
        clearForm,
    } = usePlaygroundForm({
        helpCenterId: storeData.helpCenterId,
        shopName: storeData.storeName,
        snippetHelpCenterId: storeData.snippetHelpCenterId,
    })

    const onSendMessage = () => {
        if (!isFormValid) {
            return
        }

        const newMessage = mapFormValuesToMessage(formValues)

        setMessages((prevMessages) => [...prevMessages, newMessage])
        clearForm()
    }

    const onNewConversation = () => {
        setMessages([])
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
                        messages.map((message, index) => (
                            <PlaygroundMessageComponent
                                sender={message.sender}
                                type={message.type}
                                message={message.message}
                                key={index}
                                withAnimation
                            />
                        ))
                    )}
                </div>
            </div>
            <div className={css.inputContainer}>
                <PlaygroundInputSection
                    formValues={formValues}
                    onFormValuesChange={onFormValuesChange}
                    isDisabled={isDisabled}
                    disabledMessage={disabledMessage}
                    isInitialMessage={messages.length === 0}
                    onSendMessage={onSendMessage}
                    onNewConversation={onNewConversation}
                />
            </div>
        </div>
    )
}
