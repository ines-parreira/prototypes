import React, { useCallback, useMemo, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useParams,
} from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { ChannelsStep } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import { HandoverStep } from 'pages/aiAgent/Onboarding/components/steps/HandoverStep/HandoverStep'
import { KnowledgeStep } from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'
import { PersonalityPreviewStep } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import { PersonalityStep } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersonalityStep'
import { ShopifyIntegrationStep } from 'pages/aiAgent/Onboarding/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import { SkillsetStep } from 'pages/aiAgent/Onboarding/components/steps/SkillsetStep/SkillsetStep'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { ConvAiOnboardingLayout } from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

export const AiAgentOnboarding = () => {
    const [selectedScope, setSelectedScope] = useState<AiAgentScopes[]>([])
    const { shopName, step, shopType } = useParams<{
        shopName: string
        step: string
        shopType: string
    }>()
    const { validSteps } = useSteps({ shopName, selectedScope })
    const { routes } = useAiAgentNavigation({ shopName })
    const history = useHistory()

    const isConvAiOnboardingEnabled =
        useFlags()[FeatureFlagKey.ConvAiOnboarding]

    const currentIndex = validSteps.findIndex(
        (validStep) => validStep.step === step,
    )

    const goToStep = useCallback(
        (nextStep: WizardStepEnum) => {
            if (shopType && shopName) {
                history.push(
                    `/app/ai-agent/${shopType}/${shopName}/onboarding/${nextStep}`,
                )
            } else {
                history.push(`/app/ai-agent/onboarding/${nextStep}`)
            }
        },
        [history, shopName, shopType],
    )

    const stepProps: StepProps = useMemo(
        () => ({
            currentStep: currentIndex + 1,
            totalSteps: validSteps.length,
            goToStep,
        }),
        [currentIndex, validSteps.length, goToStep],
    )

    const isValidStep = useMemo(
        () => validSteps.some((validStep) => validStep.step === step),
        [validSteps, step],
    )

    if (isConvAiOnboardingEnabled === false) {
        return <Redirect to={routes.main} />
    }

    const renderStep = () => {
        if (!isValidStep && validSteps.length > 0) {
            return (
                <Redirect
                    to={`/app/ai-agent/onboarding/${validSteps[0].step}`}
                />
            )
        }

        switch (step) {
            case WizardStepEnum.SHOPIFY_INTEGRATION:
                return <ShopifyIntegrationStep {...stepProps} />
            case WizardStepEnum.CHANNELS:
                return <ChannelsStep {...stepProps} />
            case WizardStepEnum.KNOWLEDGE:
                return <KnowledgeStep {...stepProps} />
            case WizardStepEnum.HANDOVER:
                return <HandoverStep {...stepProps} />
            case WizardStepEnum.PERSONALITY_PREVIEW:
                return <PersonalityPreviewStep {...stepProps} />
            case WizardStepEnum.SALES_PERSONALITY:
                return <PersonalityStep {...stepProps} />
            default:
                return (
                    <SkillsetStep
                        {...stepProps}
                        setSelectedScope={setSelectedScope}
                    />
                )
        }
    }

    return (
        <ConvAiOnboardingLayout>
            <Switch>
                <Route
                    path="/app/ai-agent/onboarding/:step"
                    render={renderStep}
                />
                <Route
                    path="/app/ai-agent/:shopType/:shopName/onboarding/:step"
                    render={renderStep}
                />
            </Switch>
        </ConvAiOnboardingLayout>
    )
}
