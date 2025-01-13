import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useRef, useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    AccountConfigurationWithHttpIntegration,
    AiAgentOnboardingState,
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {PlaygroundPromptType} from 'models/aiAgentPlayground/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {useAiAgentOnboardingNotification} from '../../hooks/useAiAgentOnboardingNotification'
import {usePlaygroundForm} from '../../hooks/usePlaygroundForm'
import {usePlaygroundMessages} from '../../hooks/usePlaygroundMessages'
import {
    mapPlaygroundPromptToMessage,
    mapPlaygroundFormValuesToMessage,
} from '../../utils/playground-messages.utils'
import {PlaygroundInputSection} from '../PlaygroundInputSection/PlaygroundInputSection'
import PlaygroundMessageComponent, {
    AI_AGENT_SENDER,
} from '../PlaygroundMessage/PlaygroundMessage'

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
            formValues.customer.name || formValues.customer.email
        )
        void onMessageSend(playgroundMessage, {
            customer: formValues.customer,
            subject: formValues.subject,
        })
        onFormValuesChange('message', '')
    }

    const {
        isAdmin,
        isLoading,
        onboardingNotificationState,
        handleOnSave,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({
        shopName: storeData.storeName,
    })

    const handleOnSaveTestBeforeActivation = useCallback(async () => {
        const isFullyOnboarded =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.FullyOnboarded
        const isActivated =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.Activated

        if (isFullyOnboarded || isActivated) return

        const payload: Partial<OnboardingNotificationState> = {
            onboardingState: AiAgentOnboardingState.FinishedSetup,
            testBeforeActivationDatetimes: onboardingNotificationState
                ? [
                      ...onboardingNotificationState.testBeforeActivationDatetimes,
                      new Date().toISOString(),
                  ]
                : [new Date().toISOString()],
        }
        await handleOnSave(payload)
    }, [handleOnSave, onboardingNotificationState])

    const onSendMessage = () => {
        if (!isFormValid) {
            return
        }

        const playgroundMessage = mapPlaygroundFormValuesToMessage(formValues)
        void onMessageSend(playgroundMessage, {
            customer: formValues.customer,
            subject: formValues.subject,
        })

        onFormValuesChange('message', '')

        if (isAdmin && isAiAgentOnboardingNotificationEnabled) {
            void handleOnSaveTestBeforeActivation()
        }
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
                    isDisabled={isDisabled || isMessageSending || isLoading}
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
