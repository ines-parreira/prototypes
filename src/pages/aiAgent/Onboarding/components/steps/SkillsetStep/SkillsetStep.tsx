import React, { FC, useCallback, useMemo } from 'react'

import { isEqual } from 'lodash'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import Goals from 'pages/aiAgent/Onboarding/components/Goals/Goals'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useCreateOnboarding'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    LoadingPulserIcon,
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './SkillsetStep.less'

type SkillsetFormValues = {
    scopes: AiAgentScopes[]
}

type SkillsetStepProps = StepProps & {
    setSelectedScope: (selectedScope: AiAgentScopes[]) => void
}

export const SkillsetStep: FC<SkillsetStepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    setSelectedScope,
}) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { validSteps } = useSteps({ shopName })

    useCheckOnboardingCompleted()

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()
    const {
        mutate: doCreateOnboardingMutation,
        isLoading: isCreatingOnboarding,
    } = useCreateOnboarding()

    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountDomain = currentAccount.get('domain')

    // Loading state
    const isLoading =
        isLoadingOnboardingData || isUpdatingOnboarding || isCreatingOnboarding

    // Form initialization
    const methods = useForm<SkillsetFormValues>({
        values: { scopes: data?.scopes ?? [] },
    })

    const { watch, setValue } = methods
    const selectedScope = watch('scopes')
    setSelectedScope(selectedScope)

    const onSkillsetChange = useCallback(
        (newSkillset: AiAgentScopes[]) => {
            setValue('scopes', newSkillset)
        },
        [setValue],
    )

    const onNextStep = useCallback(() => {
        const nextStep = validSteps[currentStep]?.step

        goToStep(nextStep)
    }, [validSteps, currentStep, goToStep])

    const handleSubmit = useCallback(() => {
        if (isEqual(selectedScope, data?.scopes) && data && 'id' in data) {
            onNextStep()
            return
        }
        if (data && 'id' in data) {
            // Update onboarding
            doUpdateOnboardingMutation(
                {
                    id: data.id as string,
                    data: {
                        ...data,
                        id: data.id as string,
                        scopes: selectedScope,
                    },
                },
                { onSuccess: onNextStep },
            )
        } else {
            // Create onboarding
            doCreateOnboardingMutation(
                {
                    currentStepName: WizardStepEnum.SKILLSET,
                    scopes: selectedScope,
                    gorgiasDomain: accountDomain,
                },
                { onSuccess: onNextStep },
            )
        }
    }, [
        selectedScope,
        data,
        doUpdateOnboardingMutation,
        doCreateOnboardingMutation,
        onNextStep,
        accountDomain,
    ])

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
                onNextClick={handleSubmit}
                onBackClick={() => {}}
            >
                <MainTitle
                    titleBlack="Welcome to AI Agent!"
                    titleMagenta="Select your skills"
                    secondaryTitle="to get started."
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
                                removeLinksFromMessages
                            />
                        </ChatIntegrationPreview>
                    </div>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}

export default SkillsetStep
