import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import classNames from 'classnames'

import { AiAgentNotificationType } from 'automate/notifications/types'
import useFlag from 'core/flags/hooks/useFlag'
import {
    AccountConfigurationWithHttpIntegration,
    AiAgentOnboardingState,
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {
    MessageType,
    PlaygroundPromptType,
} from 'models/aiAgentPlayground/types'
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import { useAiAgentOnboardingNotification } from '../../../hooks/useAiAgentOnboardingNotification'
import { useAiAgentHttpIntegration } from '../../hooks/useAiAgentHttpIntegration'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import { usePlaygroundMessages } from '../../hooks/usePlaygroundMessages'
import { usePlaygroundTracking } from '../../hooks/usePlaygroundTracking'
import {
    mapPlaygroundFormValuesToMessage,
    mapPlaygroundPromptToMessage,
} from '../../utils/playground-messages.utils'
import KnowledgeSourcesWrapper from '../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper'
import { PlaygroundInitialContent } from '../PlaygroundInitialContent/PlaygroundInitialContent'
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
    const isStandalone = useFlag(FeatureFlagKey.StandaloneHandoverCapabilities)

    const messageContainerRef = useRef<HTMLDivElement>(null)
    const [channel, setChannel] = useState<PlaygroundChannels>(
        isStandalone ? 'chat' : 'email',
    )
    const [channelAvailability, setChannelAvailability] =
        useState<PlaygroundChannelAvailability>('online')
    const feedbackPollingStopRef = useRef<(() => void) | null>(null)

    const { httpIntegrationId, baseUrl } = useAiAgentHttpIntegration()

    const {
        messages,
        onMessageSend,
        onNewConversation,
        isMessageSending,
        isWaitingResponse,
    } = usePlaygroundMessages({
        storeData,
        httpIntegrationId: httpIntegrationId || accountData.httpIntegration?.id,
        gorgiasDomain: accountData.gorgiasDomain,
        accountId: accountData.accountId,
        currentUserFirstName,
        channel,
        channelIntegrationId:
            channel === 'chat'
                ? storeData.monitoredChatIntegrations[0]
                : undefined,
        channelAvailability,
        baseUrl,
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

    const {
        data: storeWfConfigurations = [],
        isInitialLoading: isStoreWfConfigurationsInitialLoading,
    } = useGetStoreWorkflowsConfigurations({
        storeName: storeData.storeName,
        storeType: storeData.shopType,
        triggers: ['llm-prompt'],
    })

    const hasActionsInTestMode = useMemo(() => {
        return storeWfConfigurations.some(
            (config) => config.should_run_in_test_mode === true,
        )
    }, [storeWfConfigurations])

    const handleNewConversation = useCallback(() => {
        onNewConversation()
        clearForm()
        // Stop feedback polling if it's active
        if (feedbackPollingStopRef.current) {
            feedbackPollingStopRef.current()
        }
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
            {!isStoreWfConfigurationsInitialLoading && hasActionsInTestMode && (
                <>
                    <Alert type={AlertType.Warning} icon className="mb-3">
                        Actions are enabled. Executing an Action will run live
                        and may update your store data.
                    </Alert>
                </>
            )}
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
                                    key={index}
                                    channel={channel}
                                    withAnimation
                                >
                                    {message.type === MessageType.MESSAGE &&
                                        message.executionId && (
                                            <KnowledgeSourcesWrapper
                                                executionId={
                                                    message.executionId
                                                }
                                                storeConfiguration={storeData}
                                                onFeedbackPollingStop={(
                                                    stopFn,
                                                ) => {
                                                    feedbackPollingStopRef.current =
                                                        stopFn
                                                }}
                                                // we get the outcome from the ticket event message
                                                outcome={(() => {
                                                    const ticketEventMessage =
                                                        messages.find(
                                                            (m) =>
                                                                m.type ===
                                                                MessageType.TICKET_EVENT,
                                                        )
                                                    return ticketEventMessage?.type ===
                                                        MessageType.TICKET_EVENT
                                                        ? ticketEventMessage.outcome
                                                        : undefined
                                                })()}
                                            />
                                        )}
                                </PlaygroundMessageComponent>
                            </div>
                        ))
                    )}
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
