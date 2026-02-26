import type React from 'react'
import { useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import type { PreviewId } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import { getFirstPreviewForPreviewType } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import { PersonalityPreviewGroup } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/PersonalityPreviewGroup'
import { Separator } from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import css from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep.less'
import { mapScopeToPreviewType } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep.utils'
import type { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetChatIntegrationColor } from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useTransformToneOfVoiceConversations } from 'pages/aiAgent/Onboarding/hooks/useTransformToneOfVoiceConversations'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

export const PersonalityPreviewStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName, isStoreSelected })

    const { data } = useGetOnboardingData(shopName)

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const previewType = mapScopeToPreviewType(data?.scopes ?? [])

    const [selectedPreview, setSelectedPreview] = useState<{
        caption: string
        title: string
        id: PreviewId
    }>()

    const storeIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const { previewConversation, isPreviewLoading } =
        useTransformToneOfVoiceConversations(
            storeIntegration.id,
            shopName,
            selectedPreview?.id,
        )

    // Select first preview automatically when loaded
    useEffect(() => {
        if (data?.scopes) {
            setSelectedPreview(getFirstPreviewForPreviewType(previewType))
        }
    }, [previewType, data])

    const { mainColor, conversationColor } = useGetChatIntegrationColor({
        shopName,
        chatIntegrationIds: data?.chatIntegrationIds,
    })

    const onNextClick = () => {
        const nextStep = validSteps[currentStep]?.step

        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const handlePreviewSelect = (preview: {
        caption: string
        title: string
        id: PreviewId
    }) => {
        setSelectedPreview(preview)
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardTovClicked, {
            title: preview.title,
            shopName,
        })
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <MainTitle
                    titleBlack="Now see how your AI Agent will respond to"
                    titleMagenta=" your customers"
                />
                <Separator />
                <AIBanner fillStyle="fill">
                    Preview AI Agent’s personality, crafted using a friendly
                    tone of voice which you can fine-tune anytime in your
                    Settings.
                </AIBanner>
                <Separator />
                <PersonalityPreviewGroup
                    previewType={previewType}
                    selectedPreviewId={selectedPreview?.id}
                    onPreviewSelect={handlePreviewSelect}
                />
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={false}
                icon={''}
                caption="Here’s a sample conversation with your AI Agent, crafted using a friendly tone of voice. You can adjust its personality in Settings anytime."
            >
                <div className={css.previewContainer}>
                    <ChatIntegrationPreview
                        {...{
                            ...chatPreviewSettings,
                            mainColor:
                                mainColor ?? chatPreviewSettings.mainColor,
                        }}
                    >
                        <AiAgentChatConversation
                            {...{
                                ...agentChatConversationSettings,
                                conversationColor:
                                    conversationColor ??
                                    agentChatConversationSettings.conversationColor,
                            }}
                            messages={previewConversation?.messages}
                            isTyping={isPreviewLoading}
                            removeLinksFromMessages
                        />
                    </ChatIntegrationPreview>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
