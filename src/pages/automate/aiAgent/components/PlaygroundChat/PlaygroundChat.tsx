import React, {useEffect, useRef, useState} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    AccountConfigurationWithHttpIntegration,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {PlaygroundPromptType} from 'models/aiAgentPlayground/types'
import {FeatureFlagKey} from 'config/featureFlags'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {PlaygroundInputSection} from '../PlaygroundInputSection/PlaygroundInputSection'
import PlaygroundMessageComponent, {
    AI_AGENT_SENDER,
} from '../PlaygroundMessage/PlaygroundMessage'
import {usePlaygroundForm} from '../../hooks/usePlaygroundForm'
import {usePlaygroundMessages} from '../../hooks/usePlaygroundMessages'

import {
    mapPlaygroundPromptToMessage,
    mapPlaygroundFormValuesToMessage,
} from '../../utils/playground-messages.utils'
import {CustomerHttpIntegrationDataMock} from '../../constants'
import css from './PlaygroundChat.less'
import {PlaygroundChannels} from './PlaygroundChat.types'

type Props = {
    storeData: StoreConfiguration
    accountData: AccountConfigurationWithHttpIntegration
    currentUserFirstName?: string
}

export const PlaygroundChat = ({
    storeData,
    accountData,
    currentUserFirstName,
}: Props) => {
    const messageContainerRef = useRef<HTMLDivElement>(null)
    const [channel, setChannel] = useState<PlaygroundChannels>('email')

    const isTestModeInChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChatTestMode]

    const {
        messages,
        onMessageSend,
        onNewConversation,
        isMessageSending,
        isWaitingResponse,
    } = usePlaygroundMessages({
        storeData,
        httpIntegrationId: accountData.httpIntegration?.id,
        gorgiasDomain: accountData.gorgiasDomain,
        accountId: accountData.accountId,
        currentUserFirstName,
        channel,
    })

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

    const handleNewConversation = () => {
        onNewConversation()
        clearForm()
    }

    const onPromptMessage = (prompt: PlaygroundPromptType) => {
        const playgroundMessage = mapPlaygroundPromptToMessage(
            prompt,
            formValues.customerName || formValues.customerEmail
        )
        void onMessageSend(playgroundMessage, {
            customerEmail:
                formValues.customerEmail ??
                CustomerHttpIntegrationDataMock.address,
            subject: formValues.subject,
        })
        onFormValuesChange('message', '')
    }

    const onSendMessage = () => {
        if (!isFormValid) {
            return
        }

        const playgroundMessage = mapPlaygroundFormValuesToMessage(formValues)
        void onMessageSend(playgroundMessage, {
            customerEmail:
                formValues.customerEmail ??
                CustomerHttpIntegrationDataMock.address,
            subject: formValues.subject,
        })

        onFormValuesChange('message', '')
    }
    const onChannelChange = (channel: PlaygroundChannels) => {
        setChannel(channel)
    }

    useEffect(() => {
        if (messages.length > 0) {
            messageContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }
    }, [messages])

    const isInitialMessage =
        messages.filter((m) => m.sender !== AI_AGENT_SENDER).length === 0

    return (
        <div className={css.container}>
            {isTestModeInChatEnabled && isInitialMessage && (
                <Alert
                    className={css.alertContainer}
                    type={AlertType.Success}
                    icon
                    role="alert"
                >
                    No messages will be sent, no data will change and no actions
                    will be performed while testing.
                </Alert>
            )}

            <div className={css.outputContainer}>
                <div className={css.outputInner} ref={messageContainerRef}>
                    {messages.map((message, index) => (
                        <PlaygroundMessageComponent
                            message={message}
                            key={index}
                            channel={channel}
                            withAnimation
                        />
                    ))}
                </div>
            </div>
            <div className={css.inputContainer}>
                <PlaygroundInputSection
                    formValues={formValues}
                    onFormValuesChange={onFormValuesChange}
                    isDisabled={isDisabled || isMessageSending}
                    disabledMessage={disabledMessage}
                    isInitialMessage={isInitialMessage}
                    isMessageSending={isMessageSending}
                    onSendMessage={onSendMessage}
                    onNewConversation={handleNewConversation}
                    onChannelChange={onChannelChange}
                    channel={channel}
                    isWaitingResponse={isWaitingResponse}
                    onPromptMessage={onPromptMessage}
                    isChatTestModeEnabled={isTestModeInChatEnabled}
                />
            </div>
        </div>
    )
}
