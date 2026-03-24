import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useParams,
} from 'react-router-dom'

import { EngagementStep } from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/EngagementStep'
import { HandoverStep } from 'pages/aiAgent/Onboarding_V2/components/steps/HandoverStep/HandoverStep'
import { KnowledgeStep } from 'pages/aiAgent/Onboarding_V2/components/steps/KnowledgeStep/KnowledgeStep'
import { PersonalityStep } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersonalityStep'
import { ShopifyIntegrationStep } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import { ToneOfVoiceStep } from 'pages/aiAgent/Onboarding_V2/components/steps/ToneOfVoiceStep/ToneOfVoiceStep'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { ConvAiOnboardingLayout } from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'

export const AiAgentOnboarding = () => {
    const [isStoreSelected, setIsStoreSelected] = useState(false)
    const hasTrackedOpenRef = useRef(false)
    const { shopName, step, shopType } = useParams<{
        shopName: string
        step: string
        shopType: string
    }>()
    const { validSteps } = useSteps({
        shopName,
        isStoreSelected,
    })
    const { data: onboardingData } = useGetOnboardingData(shopName)
    const history = useHistory()

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
            isStoreSelected,
        }),
        [currentIndex, validSteps.length, goToStep, isStoreSelected],
    )

    const isValidStep = useMemo(
        () => validSteps.some((validStep) => validStep.step === step),
        [validSteps, step],
    )

    useEffect(() => {
        if (hasTrackedOpenRef.current || !validSteps.length) return

        const isReturningUser = Boolean(
            onboardingData && 'id' in onboardingData,
        )
        const stepNumber = currentIndex + 1

        logEvent(SegmentEvent.AiAgentOnboardingOpened, {
            onboardingFlow: 'wizard',
            stepNumber,
            isReturningUser,
            shopName: shopName ?? 'unknown',
        })

        hasTrackedOpenRef.current = true
    }, [onboardingData, validSteps, currentIndex, shopName])

    // Always allow onboarding wizard to be accessible regardless of the flag

    const renderStep = () => {
        if (!isValidStep && validSteps.length > 0) {
            const basePath =
                shopType && shopName
                    ? `/app/ai-agent/${shopType}/${shopName}/onboarding`
                    : '/app/ai-agent/onboarding'

            return <Redirect to={`${basePath}/${validSteps[0].step}`} />
        }

        switch (step) {
            case WizardStepEnum.SHOPIFY_INTEGRATION:
                return (
                    <ShopifyIntegrationStep
                        {...stepProps}
                        setIsStoreSelected={setIsStoreSelected}
                    />
                )
            case WizardStepEnum.TONE_OF_VOICE:
                return <ToneOfVoiceStep {...stepProps} />
            case WizardStepEnum.KNOWLEDGE:
                return <KnowledgeStep {...stepProps} />
            case WizardStepEnum.HANDOVER:
                return <HandoverStep {...stepProps} />
            case WizardStepEnum.SALES_PERSONALITY:
                return <PersonalityStep {...stepProps} />
            case WizardStepEnum.ENGAGEMENT:
                return <EngagementStep {...stepProps} />
            default:
                return <ToneOfVoiceStep {...stepProps} />
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
