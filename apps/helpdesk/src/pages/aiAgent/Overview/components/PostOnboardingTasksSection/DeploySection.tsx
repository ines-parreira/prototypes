import { useEffect, useMemo, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'
import type { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'
import { PostStoreInstallationStepStatus } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { useIsAiAgentDuringDeployment } from '../../hooks/useIsAiAgentDuringDeployment'
import { ChatToggle } from '../AiAgentTasks/ChatToggle'
import { EmailToggle } from '../AiAgentTasks/EmailToggle'
import { SuccessModal } from '../AiAgentTasks/SuccessModal'
import type { PostOnboardingStepMetadata } from './types'
import { handleAiAgentConfigurationError } from './utils'

import css from './DeploySection.less'

type Props = {
    stepMetadata: PostOnboardingStepMetadata
    step: StepConfiguration
    updateStep: (step: StepConfiguration) => Promise<void>
    markPostStoreInstallationAsCompleted: () => Promise<void>
    needsTrialOptIn: boolean
}

export const DeploySection = ({
    stepMetadata,
    step,
    updateStep,
    markPostStoreInstallationAsCompleted,
    needsTrialOptIn,
}: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const [isEmailChannelEnabled, setIsEmailChannelEnabled] = useState(false)
    const [isChatChannelEnabled, setIsChatChannelEnabled] = useState(false)
    const [isAiAgentDeployed, setIsAiAgentDeployed] = useState(false)

    const { updateSettingsAfterAiAgentEnabled } = useAiAgentEnabled({
        monitoredEmailIntegrations:
            storeConfiguration?.monitoredEmailIntegrations || [],
        monitoredChatIntegrations:
            storeConfiguration?.monitoredChatIntegrations || [],
        isEnablingChatChannel: isChatChannelEnabled,
        isEnablingEmailChannel: isEmailChannelEnabled,
    })

    const didUpdateSettingsAfterAiAgentEnabledRef = useRef(false)

    const [isAiAgentDuringDeployment, setIsAiAgentDuringDeployment] =
        useIsAiAgentDuringDeployment()

    useEffect(() => {
        if (
            isAiAgentDeployed &&
            !didUpdateSettingsAfterAiAgentEnabledRef.current
        ) {
            didUpdateSettingsAfterAiAgentEnabledRef.current = true
            updateSettingsAfterAiAgentEnabled()
        }
    }, [isAiAgentDeployed, updateSettingsAfterAiAgentEnabled])

    const updateAiAgentChannels = async (
        storeConfiguration: StoreConfiguration,
    ): Promise<void> => {
        try {
            setIsAiAgentDuringDeployment(true)
            await updateStoreConfiguration(storeConfiguration)
            await updateStep({
                ...step,
                stepCompletedDatetime: new Date().toISOString(),
            })
            await markPostStoreInstallationAsCompleted()
            setIsAiAgentDeployed(true)

            logEventsForDeploymentStep()
        } catch (error) {
            handleAiAgentConfigurationError(error)
            setIsAiAgentDuringDeployment(false)
        }
    }

    const handleOnClose = () => {
        setIsAiAgentDeployed(false)
        setIsAiAgentDuringDeployment(false)
    }

    const channel = useMemo(
        () => (isChatChannelEnabled ? 'chat' : 'email'),
        [isChatChannelEnabled],
    )
    const logEventsForDeploymentStep = () => {
        logEvent(SegmentEvent.PostOnboardingTaskCompleted, {
            step: stepMetadata.stepName,
            status: PostStoreInstallationStepStatus.COMPLETED,
            shop_name: shopName,
            shop_type: shopType,
        })
        logEvent(SegmentEvent.PostOnboardingTaskActionDone, {
            step: stepMetadata.stepName,
            action: `deployed_${isChatChannelEnabled ? 'chat' : 'email'}`,
            shop_name: shopName,
            shop_type: shopType,
        })
    }

    return (
        <div className={css.container}>
            <Text size="md" variant="regular">
                {stepMetadata.stepDescription}
            </Text>
            <div className={css.channelsToggles}>
                <EmailToggle
                    isEmailChannelEnabled={isEmailChannelEnabled}
                    isLoading={isAiAgentDuringDeployment && !isAiAgentDeployed}
                    isReadOnly={needsTrialOptIn}
                    setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                    onEmailToggle={updateAiAgentChannels}
                    storeConfiguration={storeConfiguration}
                    shopName={shopName}
                />
                <ChatToggle
                    isChatChannelEnabled={isChatChannelEnabled}
                    isLoading={isAiAgentDuringDeployment && !isAiAgentDeployed}
                    isReadOnly={needsTrialOptIn}
                    setIsChatChannelEnabled={setIsChatChannelEnabled}
                    onChatToggle={updateAiAgentChannels}
                    storeConfiguration={storeConfiguration}
                    shopName={shopName}
                    shopType={shopType}
                />
            </div>

            <SuccessModal
                isOpen={isAiAgentDeployed}
                title={`AI Agent is now live on your ${channel}!`}
                description={
                    <>
                        Your AI Agent will start to{' '}
                        <span className={css.highlight}>
                            automatically answer customer questions{' '}
                        </span>
                        on {`${channel}`}, freeing up your team to connect with
                        customers and resolve complex tasks. Return here to
                        review AI Agent&apos;s performance and find insights to
                        improve over time.
                    </>
                }
                actionLabel="Got it"
                handleOnClose={handleOnClose}
            />
        </div>
    )
}
