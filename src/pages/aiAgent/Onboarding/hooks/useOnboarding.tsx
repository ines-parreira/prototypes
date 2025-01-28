import React, {useEffect, useMemo, useState} from 'react'

import {ChannelsStep} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import {KnowledgeStep} from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'
import {PersonalityPreviewStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import {PersonalityStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersonalityStep'
import {ShopifyIntegrationStep} from 'pages/aiAgent/Onboarding/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import {SkillsetStep} from 'pages/aiAgent/Onboarding/components/steps/SkillsetStep/SkillsetStep'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

type OnboardingStep = {
    step: WizardStepEnum
    condition: boolean
    render: (
        onNextClick: () => void,
        onBackClick: () => void,
        currentSteps: number,
        totalSteps: number
    ) => JSX.Element
}

export const useOnboarding = ({shopName}: {shopName: string}) => {
    const [currentStep, setCurrentStep] = useState(0)

    const {integration} = useShopifyIntegrationAndScope(shopName)
    const {emailIntegrations, defaultIntegration} = useEmailIntegrations()
    const {scope, lastStep, setOnboardingData} = useOnboardingContext()

    const stepsMap = useMemo(
        () => ({
            [WizardStepEnum.SKILLSET]: {
                step: WizardStepEnum.SKILLSET,
                condition: true,
                render: (
                    onNextClick: () => void,
                    onBackClick: () => void,
                    currentStep: number,
                    totalSteps: number
                ) => (
                    <SkillsetStep
                        {...{
                            currentStep,
                            totalSteps,
                            onNextClick,
                            onBackClick,
                        }}
                    />
                ),
            },
            [WizardStepEnum.SHOPIFY_INTEGRATION]: {
                step: WizardStepEnum.SHOPIFY_INTEGRATION,
                condition: !integration,
                render: (
                    onNextClick: () => void,
                    onBackClick: () => void,
                    currentStep: number,
                    totalSteps: number
                ) => (
                    <ShopifyIntegrationStep
                        {...{
                            currentStep,
                            totalSteps,
                            onNextClick,
                            onBackClick,
                        }}
                    />
                ),
            },
            [WizardStepEnum.EMAIL_INTEGRATION]: {
                step: WizardStepEnum.EMAIL_INTEGRATION,
                condition: !emailIntegrations && !defaultIntegration,
                render: () => <div>Email Integration Step</div>,
            },
            [WizardStepEnum.CHANNELS]: {
                step: WizardStepEnum.CHANNELS,
                condition: true,
                render: (
                    onNextClick: () => void,
                    onBackClick: () => void,
                    currentStep: number,
                    totalSteps: number
                ) => (
                    <ChannelsStep
                        {...{
                            currentStep,
                            totalSteps,
                            onNextClick,
                            onBackClick,
                        }}
                    />
                ),
            },
            [WizardStepEnum.PERSONALITY_PREVIEW]: {
                step: WizardStepEnum.PERSONALITY_PREVIEW,
                condition: true,
                render: (
                    onNextClick: () => void,
                    onBackClick: () => void,
                    currentStep: number,
                    totalSteps: number
                ) => (
                    <PersonalityPreviewStep
                        {...{
                            currentStep,
                            totalSteps,
                            onNextClick,
                            onBackClick,
                        }}
                    />
                ),
            },
            [WizardStepEnum.SALES_PERSONALITY]: {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: scope.includes(AiAgentScopes.SALES),
                render: (
                    onNextClick: () => void,
                    onBackClick: () => void,
                    currentStep: number,
                    totalSteps: number
                ) => (
                    <PersonalityStep
                        {...{
                            currentStep,
                            totalSteps,
                            onNextClick,
                            onBackClick,
                        }}
                    />
                ),
            },
            [WizardStepEnum.HANDOVER]: {
                step: WizardStepEnum.HANDOVER,
                condition: true,
                render: () => <div>Handover Step</div>,
            },
            [WizardStepEnum.KNOWLEDGE]: {
                step: WizardStepEnum.KNOWLEDGE,
                condition: true,
                render: (
                    onNextClick: () => void,
                    onBackClick: () => void,
                    currentStep: number,
                    totalSteps: number
                ) => (
                    <KnowledgeStep
                        {...{
                            currentStep,
                            totalSteps,
                            onNextClick,
                            onBackClick,
                        }}
                    />
                ),
            },
        }),
        [integration, emailIntegrations, defaultIntegration, scope]
    )

    const [userSteps, setUserSteps] = useState<OnboardingStep[]>([
        stepsMap[WizardStepEnum.SKILLSET],
    ])

    useEffect(() => {
        /* Updates the necessary steps according to the scope */
        const auxUserSteps: OnboardingStep[] = []
        Object.values(stepsMap).forEach((step) => {
            if (step.step === lastStep) setCurrentStep(auxUserSteps.length)
            if (step.condition) auxUserSteps.push(step)
        })
        setUserSteps(auxUserSteps)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope])

    const totalSteps = useMemo(() => userSteps.length, [userSteps])

    const currentStepInstance = useMemo(
        () => userSteps[currentStep],
        [userSteps, currentStep]
    )

    const nextStep = () => {
        // TODO: We need to fire a request to update the server state
        if (currentStep < totalSteps - 1) {
            setCurrentStep((step) => step + 1)
            if (setOnboardingData) {
                setOnboardingData({
                    lastStep: userSteps[currentStep + 1].step,
                })
            }
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((step) => step - 1)
            if (setOnboardingData) {
                setOnboardingData({
                    lastStep: userSteps[currentStep - 1].step,
                })
            }
        }
    }

    return {
        currentStep,
        nextStep,
        prevStep,
        totalSteps,
        render: () =>
            currentStepInstance.render(
                nextStep,
                prevStep,
                currentStep + 1,
                totalSteps
            ),
    }
}
