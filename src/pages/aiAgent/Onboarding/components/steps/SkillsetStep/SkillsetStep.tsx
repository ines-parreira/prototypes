import React from 'react'

import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import Goals from 'pages/aiAgent/Onboarding/components/Goals/Goals'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {
    chatPreviewSettings,
    agentChatConversationSettings,
} from 'pages/aiAgent/Onboarding/settings'
import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import css from './SkillsetStep.less'

export const SkillsetStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {scope, setOnboardingData} = useOnboardingContext()

    const onSkillsetChange = (skillset: string[] | null) => {
        if (setOnboardingData) {
            setOnboardingData({
                scope: skillset as AiAgentScopes[],
            })
        }
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
                    titleBlack="Welcome to Conversational AI"
                    titleMagenta="Select your agents below to get  started!"
                />

                <div className={css.skillSetContainer}>
                    <Goals value={scope} onSelect={onSkillsetChange} />
                </div>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={false} icon={''}>
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
