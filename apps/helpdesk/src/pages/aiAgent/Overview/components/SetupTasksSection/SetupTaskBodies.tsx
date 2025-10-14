import React, { useState } from 'react'

import cn from 'classnames'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button, LoadingSpinner, Text } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { usePostStoreInstallationStepsMutation } from 'pages/aiAgent/hooks/usePostStoreInstallationStepsMutation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import NewToggleField from 'pages/common/forms/NewToggleField'
import { getCurrentDomain } from 'state/currentAccount/selectors'

import { ChatToggle } from '../AiAgentTasks/ChatToggle'
import { EmailToggle } from '../AiAgentTasks/EmailToggle'
import { handleAiAgentConfigurationError } from '../PostOnboardingTasksSection/utils'

import css from './SetupTaskBodies.less'

interface SetupTaskBodyProps {
    featureUrl?: string
    isCompleted?: boolean
    shopName?: string
    shopType?: string
    stepName?: any
    postGoLiveStepId?: string
    stepStartedDatetime?: string | null
}

interface TaskBodyWithButtonConfig {
    description: string
    buttonLabel: string
}

const TaskBodyWithButton = ({
    featureUrl,
    isCompleted,
    description,
    buttonLabel,
    stepName,
    postGoLiveStepId,
    shopName,
    stepStartedDatetime,
    shopType,
}: SetupTaskBodyProps & TaskBodyWithButtonConfig) => {
    const history = useHistory()
    const accountDomain = useAppSelector(getCurrentDomain)

    const { updateStepConfiguration } = usePostStoreInstallationStepsMutation({
        accountDomain: accountDomain,
        shopName: shopName || '',
    })

    const handleClick = () => {
        if (postGoLiveStepId && stepName && !stepStartedDatetime) {
            updateStepConfiguration(postGoLiveStepId, {
                stepName,
                stepStartedDatetime: new Date().toISOString(),
            })
        }

        if (featureUrl) {
            history.push(featureUrl)

            logEvent(SegmentEvent.PostGoLiveTaskActionClicked, {
                step: stepName,
                shop_name: shopName,
                shop_type: shopType,
                action: buttonLabel,
            })
        }
    }

    return (
        <div
            className={cn(css.setupTaskBodies, {
                [css.completed]: isCompleted,
            })}
        >
            <div className={css.setupTaskDescription}>
                <Text size="sm">{description}</Text>
            </div>
            <Button size="small" onClick={handleClick} isDisabled={isCompleted}>
                {buttonLabel}
            </Button>
        </div>
    )
}

interface TaskBodyWithToggleConfig {
    description: string
    value: boolean
    onChange: () => void
    label?: string
    isLoading?: boolean
}

const TaskBodyWithToggle = ({
    isCompleted,
    description,
    value,
    onChange,
    label,
    isLoading,
}: SetupTaskBodyProps & TaskBodyWithToggleConfig) => {
    return (
        <div
            className={cn(css.setupTaskBodies, {
                [css.completed]: isCompleted,
            })}
        >
            <div className={css.setupTaskDescription}>
                <Text size="sm">{description}</Text>
            </div>
            <div className={css.setupTaskToggle}>
                <NewToggleField
                    value={value}
                    onChange={onChange}
                    className={css.toggleButton}
                    isDisabled={isCompleted}
                />
                {label && <div className={css.toggleLabel}>{label}</div>}
                {isLoading && <LoadingSpinner size="small" />}
            </div>
        </div>
    )
}

export const VerifyEmailDomainBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Ensure customers receive emails from the AI Agent by verifying your domain."
            buttonLabel="Verify"
        />
    )
}

export const UpdateShopifyPermissionsBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Update Shopify permissions to give AI Agent to information about your customers, orders and products."
            buttonLabel="Update"
        />
    )
}

export const CreateAnActionBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more."
            buttonLabel="Create"
        />
    )
}

export const MonitorAiAgentBody = (props: SetupTaskBodyProps) => {
    return (
        <TaskBodyWithButton
            {...props}
            description="Give feedback on AI Agent interactions to improve its accuracy and response quality for future customer requests."
            buttonLabel="Review"
        />
    )
}

export const PrepareTriggerOnSearchBody = (props: SetupTaskBodyProps) => {
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useAppDispatch()

    const isSalesHelpOnSearchEnabled =
        storeConfiguration?.isSalesHelpOnSearchEnabled ?? false

    const handleToggle = async () => {
        if (!storeConfiguration) return

        try {
            setIsLoading(true)
            await updateStoreConfiguration({
                ...storeConfiguration,
                isSalesHelpOnSearchEnabled: !isSalesHelpOnSearchEnabled,
            })
        } catch (error) {
            handleAiAgentConfigurationError(error, dispatch)
        } finally {
            setIsLoading(false)
        }

        logEvent(SegmentEvent.PostGoLiveTaskActionClicked, {
            step: props.stepName,
            shop_name: props.shopName,
            shop_type: props.shopType,
            action: !isSalesHelpOnSearchEnabled ? 'on' : 'off',
        })
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Guide shoppers to right products by having AI Agent start a conversation after they use search."
            value={isSalesHelpOnSearchEnabled}
            onChange={handleToggle}
            label="Turn on"
            isLoading={isLoading}
        />
    )
}

export const PrepareSuggestedProductsBody = (props: SetupTaskBodyProps) => {
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useAppDispatch()

    const isConversationStartersEnabled =
        storeConfiguration?.isConversationStartersEnabled ?? false

    const handleToggle = async () => {
        if (!storeConfiguration) return

        try {
            setIsLoading(true)
            await updateStoreConfiguration({
                ...storeConfiguration,
                isConversationStartersEnabled: !isConversationStartersEnabled,
            })
        } catch (error) {
            handleAiAgentConfigurationError(error, dispatch)
        } finally {
            setIsLoading(false)
        }

        logEvent(SegmentEvent.PostGoLiveTaskActionClicked, {
            step: props.stepName,
            shop_name: props.shopName,
            shop_type: props.shopType,
            action: !isConversationStartersEnabled ? 'on' : 'off',
        })
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Show dynamic, AI-generated questions on product pages to address common shopper questions. Brands that enable this feature see a significant lift in conversions."
            value={isConversationStartersEnabled}
            onChange={handleToggle}
            label="Turn on"
            isLoading={isLoading}
        />
    )
}

export const EnableAskAnythingBody = (props: SetupTaskBodyProps) => {
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useAppDispatch()

    const isAskAnythingInputEnabled =
        storeConfiguration?.floatingChatInputConfiguration?.isEnabled ?? false

    const handleToggle = async () => {
        if (!storeConfiguration) return

        const defaultFloatingChatInputConfiguration = {
            isDesktopOnly: false,
            isEnabled: false,
            needHelpText: '',
        }
        try {
            setIsLoading(true)
            await updateStoreConfiguration({
                ...storeConfiguration,
                floatingChatInputConfiguration: {
                    ...defaultFloatingChatInputConfiguration,
                    ...storeConfiguration.floatingChatInputConfiguration,
                    isEnabled: !isAskAnythingInputEnabled,
                },
            })
        } catch (error) {
            handleAiAgentConfigurationError(error, dispatch)
        } finally {
            setIsLoading(false)
        }

        logEvent(SegmentEvent.PostGoLiveTaskActionClicked, {
            step: props.stepName,
            shop_name: props.shopName,
            shop_type: props.shopType,
            action: !isAskAnythingInputEnabled ? 'on' : 'off',
        })
    }

    return (
        <TaskBodyWithToggle
            {...props}
            description="Transform your chat bubble into a persistent input bar that invites shoppers to ask questions anytime. Encourage engagement by keeping support top-of-mind while shoppers browse."
            value={isAskAnythingInputEnabled}
            onChange={handleToggle}
            label="Turn on"
            isLoading={isLoading}
        />
    )
}

export const EnableAIAgentOnChatBody = (props: SetupTaskBodyProps) => {
    const { isCompleted, shopName = '', shopType = '' } = props
    const dispatch = useAppDispatch()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()
    const [isChatChannelEnabled, setIsChatChannelEnabled] = useState(
        !storeConfiguration?.chatChannelDeactivatedDatetime,
    )
    const [isLoading, setIsLoading] = useState(false)

    const handleChatToggle = async (
        updatedConfig: StoreConfiguration,
    ): Promise<void> => {
        try {
            setIsLoading(true)
            await updateStoreConfiguration(updatedConfig)
            logEvent(SegmentEvent.PostGoLiveTaskActionClicked, {
                step: props.stepName,
                shop_name: props.shopName,
                shop_type: props.shopType,
                action: !isChatChannelEnabled ? 'on' : 'off',
            })
        } catch (error) {
            handleAiAgentConfigurationError(error, dispatch)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className={cn(css.setupTaskBodies, {
                [css.completed]: isCompleted,
            })}
        >
            <div className={css.setupTaskDescription}>
                <Text size="sm">
                    Start automating conversations on chat to save time and
                    provide faster, more personalized responses to your
                    customers.
                </Text>
            </div>
            <div className={css.channelToggle}>
                <ChatToggle
                    isChatChannelEnabled={isChatChannelEnabled}
                    isLoading={isLoading}
                    setIsChatChannelEnabled={setIsChatChannelEnabled}
                    onChatToggle={handleChatToggle}
                    storeConfiguration={storeConfiguration}
                    shopName={shopName}
                    shopType={shopType}
                    label="Enable"
                />
            </div>
        </div>
    )
}

export const EnableAIAgentOnEmailBody = (props: SetupTaskBodyProps) => {
    const { isCompleted, shopName = '' } = props
    const dispatch = useAppDispatch()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()
    const [isEmailChannelEnabled, setIsEmailChannelEnabled] = useState(
        !storeConfiguration?.emailChannelDeactivatedDatetime,
    )
    const [isLoading, setIsLoading] = useState(false)

    const handleEmailToggle = async (
        updatedConfig: StoreConfiguration,
    ): Promise<void> => {
        try {
            setIsLoading(true)
            await updateStoreConfiguration(updatedConfig)
            logEvent(SegmentEvent.PostGoLiveTaskActionClicked, {
                step: props.stepName,
                shop_name: props.shopName,
                shop_type: props.shopType,
                action: !isEmailChannelEnabled ? 'on' : 'off',
            })
        } catch (error) {
            handleAiAgentConfigurationError(error, dispatch)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className={cn(css.setupTaskBodies, {
                [css.completed]: isCompleted,
            })}
        >
            <div className={css.setupTaskDescription}>
                <Text size="sm">
                    Start automating conversations on email to save time and
                    provide faster, more personalized responses to your
                    customers.
                </Text>
            </div>
            <div className={css.channelToggle}>
                <EmailToggle
                    isEmailChannelEnabled={isEmailChannelEnabled}
                    isLoading={isLoading}
                    setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                    onEmailToggle={handleEmailToggle}
                    storeConfiguration={storeConfiguration}
                    shopName={shopName}
                    label="Enable"
                />
            </div>
        </div>
    )
}
