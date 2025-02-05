import React, {FC, useMemo, useCallback} from 'react'

import {FormProvider, useForm} from 'react-hook-form'
import {useParams} from 'react-router-dom'

import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import Goals from 'pages/aiAgent/Onboarding/components/Goals/Goals'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {
    LoadingPulserIcon,
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {
    chatPreviewSettings,
    agentChatConversationSettings,
} from 'pages/aiAgent/Onboarding/settings'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import css from './SkillsetStep.less'

type SkillsetFormValues = {
    scope: AiAgentScopes[]
}

export const SkillsetStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {shopName} = useParams<{shopName: string}>()
    const {integration} = useShopifyIntegrationAndScope(shopName)
    const {emailIntegrations, defaultIntegration} = useEmailIntegrations()

    const {data, isLoading} = useGetOnboardingData()

    const updateOnboardingCache = useUpdateOnboardingCache()

    const methods = useForm<SkillsetFormValues>({
        values: {
            scope: data?.scope ?? [],
        },
    })

    const {watch, setValue} = methods

    // Watch form state changes
    const selectedScope = watch('scope')

    const onSkillsetChange = useCallback(
        (newSkillset: AiAgentScopes[]) => {
            setValue('scope', newSkillset)
            updateOnboardingCache('scope', newSkillset)
        },
        [setValue, updateOnboardingCache]
    )

    const onNextStep = () => {
        if (!integration) {
            goToStep(WizardStepEnum.SHOPIFY_INTEGRATION)
            return
        }
        if (!emailIntegrations && !defaultIntegration) {
            goToStep(WizardStepEnum.EMAIL_INTEGRATION)
            return
        }
        goToStep(WizardStepEnum.CHANNELS)
    }

    const renderContent = useMemo(() => {
        if (isLoading) {
            return <LoadingPulserIcon icon="" />
        }

        return <Goals value={selectedScope} onSelect={onSkillsetChange} />
    }, [isLoading, selectedScope, onSkillsetChange])

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextStep}
                onBackClick={() => {}}
            >
                <MainTitle
                    titleBlack="Welcome to Conversational AI"
                    titleMagenta="Select your agents below to get started!"
                />

                <div className={css.skillSetContainer}>
                    <FormProvider {...methods}>{renderContent}</FormProvider>
                </div>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={isLoading} icon="">
                <div className={css.previewContainer}>
                    <div>
                        <ChatIntegrationPreview {...chatPreviewSettings}>
                            <AiAgentChatConversation
                                {...agentChatConversationSettings}
                            />
                        </ChatIntegrationPreview>
                    </div>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}

export default SkillsetStep
