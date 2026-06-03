import { useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useLocation, useParams } from 'react-router-dom'

import { useTrackStepCompleted } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackStepCompleted'
import { parseJtbdParam } from 'pages/aiAgent/utils/jtbd'

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
    const { search } = useLocation()
    const {
        value: isAiAgentOnboardingV3Enabled,
        isLoading: isAiAgentOnboardingV3Loading,
    } = useFlagWithLoading(FeatureFlagKey.AiAgentOnboardingV3, false)

    const stepName = step ?? 'unknown'
    const safeShopName = shopName ?? 'unknown'
    const isLastStep = currentStep === totalSteps

    const trackingProps = useMemo(
        () => ({
            jtbd: parseJtbdParam(search) ?? ('unknown' as const),
            onboardingVersion: isAiAgentOnboardingV3Enabled
                ? ('v3' as const)
                : ('v2' as const),
        }),
        [search, isAiAgentOnboardingV3Enabled],
    )

    const trackStepCompleted = useTrackStepCompleted({
        currentStep,
        stepName,
        shopName: safeShopName,
        ...trackingProps,
    })

    useEffect(() => {
        if (isAiAgentOnboardingV3Loading) return

        logEvent(SegmentEvent.AiAgentOnboardingStepViewed, {
            onboardingFlow: 'wizard',
            stepName,
            stepNumber: currentStep,
            shopName: safeShopName,
            ...trackingProps,
        })
    }, [
        stepName,
        currentStep,
        safeShopName,
        trackingProps,
        isAiAgentOnboardingV3Loading,
    ])

    const onNextAction = () => {
        if (!isAiAgentOnboardingV3Loading) {
            trackStepCompleted()
            logEvent(SegmentEvent.AiAgentOnboardingButtonClicked, {
                onboardingFlow: 'wizard',
                buttonType: isLastStep ? 'finish' : 'next',
                stepName,
                stepNumber: currentStep,
                shopName: safeShopName,
                ...trackingProps,
            })
        }
        onNextClick()
    }

    const onBackAction = () => {
        if (!isAiAgentOnboardingV3Loading) {
            logEvent(SegmentEvent.AiAgentOnboardingButtonClicked, {
                onboardingFlow: 'wizard',
                buttonType: 'back',
                stepName,
                stepNumber: currentStep,
                shopName: safeShopName,
                ...trackingProps,
            })
        }
        onBackClick()
    }

    const onCloseAction = onCloseClick
        ? () => {
              if (!isAiAgentOnboardingV3Loading) {
                  logEvent(SegmentEvent.AiAgentOnboardingClosed, {
                      onboardingFlow: 'wizard',
                      stepNumber: currentStep,
                      isCompleted: false,
                      shopName: safeShopName,
                      ...trackingProps,
                  })
              }
              onCloseClick()
          }
        : undefined

    return {
        onNextAction,
        onBackAction,
        onCloseAction,
    }
}
