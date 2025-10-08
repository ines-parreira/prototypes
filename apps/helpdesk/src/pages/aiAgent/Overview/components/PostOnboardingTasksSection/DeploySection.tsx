import { useEffect, useRef, useState } from 'react'

import { useParams } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { StoreConfiguration } from 'models/aiAgent/types'
import { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { useIsAiAgentDuringDeployment } from '../../hooks/useIsAiAgentDuringDeployment'
import { ChatToggle } from './ChatToggle'
import { EmailToggle } from './EmailToggle'
import { PostOnboardingLiveModal } from './PostOnboardingLiveModal'
import { PostOnboardingStepMetadata } from './types'
import { handleAiAgentConfigurationError } from './utils'

import css from './DeploySection.less'

type Props = {
    stepMetadata: PostOnboardingStepMetadata
    step: StepConfiguration
    updateStep: (step: StepConfiguration) => Promise<void>
    markPostStoreInstallationAsCompleted: () => Promise<void>
}

export const DeploySection = ({
    stepMetadata,
    step,
    updateStep,
    markPostStoreInstallationAsCompleted,
}: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const dispatch = useAppDispatch()

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

    // oxlint-disable-next-line no-unused-vars
    const [_, setIsAiAgentDuringDeployment] = useIsAiAgentDuringDeployment()

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
        } catch (error) {
            handleAiAgentConfigurationError(error, dispatch)
        }
    }

    const handleOnClose = () => {
        setIsAiAgentDeployed(false)
        setIsAiAgentDuringDeployment(false)
    }

    return (
        <div className={css.container}>
            <Text size="md" variant="regular">
                {stepMetadata.stepDescription}
            </Text>

            <div className={css.channelsToggles}>
                <EmailToggle
                    isEmailChannelEnabled={isEmailChannelEnabled}
                    setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                    onEmailToggle={updateAiAgentChannels}
                    storeConfiguration={storeConfiguration}
                    shopName={shopName}
                />
                <ChatToggle
                    isChatChannelEnabled={isChatChannelEnabled}
                    setIsChatChannelEnabled={setIsChatChannelEnabled}
                    onChatToggle={updateAiAgentChannels}
                    storeConfiguration={storeConfiguration}
                    shopName={shopName}
                    shopType={shopType}
                />
            </div>

            <PostOnboardingLiveModal
                isOpen={isAiAgentDeployed}
                channel={isChatChannelEnabled ? 'chat' : 'email'}
                handleOnClose={handleOnClose}
            />
        </div>
    )
}
