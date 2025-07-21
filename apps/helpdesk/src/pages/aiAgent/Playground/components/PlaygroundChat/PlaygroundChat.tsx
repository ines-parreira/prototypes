import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AiAgentNotificationType } from 'automate/notifications/types'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    AccountConfigurationWithHttpIntegration,
    AiAgentOnboardingState,
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { PlaygroundPromptType } from 'models/aiAgentPlayground/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import { useAiAgentOnboardingNotification } from '../../../hooks/useAiAgentOnboardingNotification'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import { usePlaygroundMessages } from '../../hooks/usePlaygroundMessages'
import { usePlaygroundTracking } from '../../hooks/usePlaygroundTracking'
import {
    mapPlaygroundFormValuesToMessage,
    mapPlaygroundPromptToMessage,
} from '../../utils/playground-messages.utils'
import { PlaygroundInputSection } from '../PlaygroundInputSection/PlaygroundInputSection'
import PlaygroundMessageComponent, {
    AI_AGENT_SENDER,
} from '../PlaygroundMessage/PlaygroundMessage'
import {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
} from './PlaygroundChat.types'

import css from './PlaygroundChat.less'

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
    const [channelAvailability, setChannelAvailability] =
        useState<PlaygroundChannelAvailability>('online')

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
        channelIntegrationId:
            channel === 'chat'
                ? storeData.monitoredChatIntegrations[0]
                : undefined,
        channelAvailability,
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

    const { onTestPageViewed } = usePlaygroundTracking({
        shopName: storeData.storeName,
    })

    const handleNewConversation = useCallback(() => {
        onNewConversation()
        clearForm()
    }, [onNewConversation, clearForm])

    const onPromptMessage = (prompt: PlaygroundPromptType) => {
        const playgroundMessage = mapPlaygroundPromptToMessage(
            prompt,
            formValues.customer.name || formValues.customer.email,
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
        handleOnSendOrCancelNotification,
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
        const isActivateAiAgentNotificationAlreadyReceived =
            !!onboardingNotificationState?.activateAiAgentNotificationReceivedDatetime

        if (
            isFullyOnboarded ||
            isActivated ||
            isActivateAiAgentNotificationAlreadyReceived
        )
            return

        const payload: Partial<OnboardingNotificationState> = {
            onboardingState: AiAgentOnboardingState.FinishedSetup,
            testBeforeActivationDatetimes: onboardingNotificationState
                ? [
                      ...onboardingNotificationState.testBeforeActivationDatetimes,
                      new Date().toISOString(),
                  ]
                : [new Date().toISOString()],
        }
        const updatedOnboardingNotificationState = await handleOnSave(payload)

        if (
            updatedOnboardingNotificationState?.testBeforeActivationDatetimes &&
            updatedOnboardingNotificationState.testBeforeActivationDatetimes
                .length >= 5
        ) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.ActivateAiAgent,
            })
        }
    }, [
        handleOnSave,
        handleOnSendOrCancelNotification,
        onboardingNotificationState,
    ])

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

    // Cleans up conversation state on unmount or when storeData changes.
    // Essential when navigating between pages, as React Query's cached storeData
    // wouldn't trigger a full component reload.
    useEffect(() => {
        return () => {
            handleNewConversation()
        }
    }, [storeData, handleNewConversation])

    useEffectOnce(() => {
        onTestPageViewed()
    })

    return (
        <div className={css.container}>
            {isInitialMessage && (
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
                    channelAvailability={channelAvailability}
                    onChannelAvailabilityChange={setChannelAvailability}
                />
            </div>
        </div>
    )
}
