import { useEffect, useRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

interface UseTrackStepCompletedParams {
    currentStep: number
    stepName: string
    shopName: string
}

/**
 * Hook to track step completion time in the onboarding wizard.
 * Automatically measures time spent on the current step and provides
 * a function to fire the completion event.
 *
 * @param currentStep - The current step number (1-based)
 * @param stepName - The step identifier (from route params)
 * @param shopName - The shop name for tracking
 */
export function useTrackStepCompleted({
    currentStep,
    stepName,
    shopName,
}: UseTrackStepCompletedParams) {
    const stepEntryTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        stepEntryTimeRef.current = Date.now()
    }, [stepName, currentStep])

    const trackStepCompleted = () => {
        const timeSpentSeconds = Math.round(
            (Date.now() - stepEntryTimeRef.current) / 1000,
        )

        logEvent(SegmentEvent.AiAgentOnboardingStepCompleted, {
            onboardingFlow: 'wizard',
            stepName,
            stepNumber: currentStep,
            timeSpentSeconds,
            shopName,
        })
    }

    return trackStepCompleted
}
