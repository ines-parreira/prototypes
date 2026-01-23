import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Box, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { OnboardingData } from 'models/aiAgent/types'
import { useGmvUsdOver30Days } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation'
import MainTitle from 'pages/aiAgent/Onboarding_V2/components/MainTitle/MainTitle'
import { ConversationLauncherSettings } from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/components/ConversationLauncherSettings'
import { ConversationStartersSettings } from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/components/ConversationStartersSettings'
import { TriggerOnSearchSettings } from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/components/TriggerOnSearchSettings'
import { ENGAGEMENT_PREVIEW_MESSAGES } from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/constants'
import { EngagementStepConfirmationPopup } from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/EngagementStepConfirmationPopup'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding_V2/settings'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

import css from './EngagementStep.less'

export const EngagementStep = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}: StepProps) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const { data } = useGetOnboardingData(shopName)
    const { mutate: doUpdateOnboardingMutation } = useUpdateOnboarding()

    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] =
        useState(false)

    const isTriggerOnSearchDisabled = useFlag(
        FeatureFlagKey.TriggerOnSearchKillSwitch,
    )

    const methods = useForm({
        values: {
            isSalesHelpOnSearchEnabled:
                data?.isSalesHelpOnSearchEnabled ?? true,
            isConversationStartersEnabled:
                data?.isConversationStartersEnabled ?? true,
            isAskAnythingInputEnabled: data?.isAskAnythingInputEnabled ?? true,
        },
    })

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const onNextStep = () => {
        const nextStep = validSteps[currentStep]?.step
        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step
        goToStep(previousStep)
    }

    const storeIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const { data: gmv, isLoading: isGmvLoading } = useGmvUsdOver30Days(
        storeIntegration.id,
    )

    const {
        watch,
        formState: { isDirty },
        handleSubmit,
    } = methods

    const isSalesHelpOnSearchEnabled = watch('isSalesHelpOnSearchEnabled')
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const isAskAnythingInputEnabled = watch('isAskAnythingInputEnabled')

    const onNextClick = (forceEnabled: boolean = false) => {
        if (!isDirty) {
            onNextStep()
            return
        }

        if (
            !isSalesHelpOnSearchEnabled &&
            !isConversationStartersEnabled &&
            !isAskAnythingInputEnabled &&
            !isConfirmationPopupOpen
        ) {
            setIsConfirmationPopupOpen(true)
            return
        }

        if (data && 'id' in data) {
            const updatedData: OnboardingData = {
                ...data,
                shopName,
                currentStepName: validSteps[currentStep]?.step,
                isConversationStartersEnabled:
                    forceEnabled || isConversationStartersEnabled,
                isAskAnythingInputEnabled:
                    forceEnabled || isAskAnythingInputEnabled,
                isSalesHelpOnSearchEnabled:
                    forceEnabled || isSalesHelpOnSearchEnabled,
            }

            doUpdateOnboardingMutation(
                { id: data.id, data: updatedData },
                {
                    onSuccess: () => {
                        setIsConfirmationPopupOpen(false)
                        onNextStep()
                    },
                },
            )
        } else {
            setIsConfirmationPopupOpen(false)
        }
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={handleSubmit(() => onNextClick())}
                onBackClick={onBackClick}
                containerClassName={css.contentContainer}
            >
                <MainTitle
                    titleBlack="Choose how AI Agent engages on your website"
                    titleMagenta=""
                />
                <div className={css.description}>
                    <Text>
                        Turn browsing into buying with smart prompts. Start
                        conversations when shoppers show interest by{' '}
                        <strong>
                            proactive guidance, answering questions,
                        </strong>{' '}
                        or <strong>inviting them to ask more.</strong>
                    </Text>
                </div>
                <FormProvider {...methods}>
                    <div className={css.form}>
                        {!isTriggerOnSearchDisabled && (
                            <TriggerOnSearchSettings
                                description="Help shoppers find the right product with a message right after they search and boost your chances of converting."
                                gmv={gmv}
                                isGmvLoading={isGmvLoading}
                            />
                        )}
                        <ConversationStartersSettings
                            description="Auto-suggest helpful product Q&As on key pages to quickly resolve customer doubts and speed up purchase decisions."
                            isEnabled
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                        />
                        <ConversationLauncherSettings
                            description="Invites customers to ask questions anytime and turn curiosity into conversions."
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                        />
                    </div>
                </FormProvider>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={false}
                icon={''}
                caption="This is a sample conversation with AI Agent. It will evolve as you onboard."
            >
                <Box justifyContent="center" width="100%">
                    <ChatIntegrationPreview {...chatPreviewSettings}>
                        <AiAgentChatConversation
                            {...agentChatConversationSettings}
                            messages={ENGAGEMENT_PREVIEW_MESSAGES}
                            isTyping={false}
                            removeLinksFromMessages
                        />
                    </ChatIntegrationPreview>
                </Box>
            </OnboardingPreviewContainer>
            <EngagementStepConfirmationPopup
                isOpen={isConfirmationPopupOpen}
                onClose={() => setIsConfirmationPopupOpen(false)}
                onTurnOff={onNextClick}
                onKeepOn={() => onNextClick(true)}
            />
        </OnboardingBody>
    )
}
