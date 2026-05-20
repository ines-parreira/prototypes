import { useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { useTrackStepCompleted } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackStepCompleted'

interface UseOnboardingStepTrackingParams {
    currentStep: number
    totalSteps: number
    onNextClick: () => void
    onBackClick: () => void
    onCloseClick?: () => void
}

export function useOnboardingStepTracking({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
    onCloseClick,
}: UseOnboardingStepTrackingParams) {
    const { step, shopName } = useParams<{ step: string; shopName: string }>()

    const stepName = step ?? 'unknown'
    const safeShopName = shopName ?? 'unknown'
    const isLastStep = currentStep === totalSteps

    const trackStepCompleted = useTrackStepCompleted({
        currentStep,
        stepName,
        shopName: safeShopName,
    })

    useEffect(() => {
        logEvent(SegmentEvent.AiAgentOnboardingStepViewed, {
            onboardingFlow: 'wizard',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
        })
    }, [stepName, currentStep, safeShopName])

    const onNextAction = () => {
        trackStepCompleted()
        logEvent(SegmentEvent.AiAgentOnboardingButtonClicked, {
            onboardingFlow: 'wizard',
            buttonType: isLastStep ? 'finish' : 'next',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
        })
        onNextClick()
    }

    const onBackAction = () => {
        logEvent(SegmentEvent.AiAgentOnboardingButtonClicked, {
            onboardingFlow: 'wizard',
            buttonType: 'back',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
        })
        onBackClick()
    }

    const onCloseAction = onCloseClick
        ? () => {
              logEvent(SegmentEvent.AiAgentOnboardingClosed, {
                  onboardingFlow: 'wizard',
                  stepNumber: currentStep,
                  isCompleted: false,
                  shopName: safeShopName,
              })
              onCloseClick()
          }
        : undefined

    return {
        onNextAction,
        onBackAction,
        onCloseAction,
    }
}
