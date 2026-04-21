import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import {
    getStoresEligibleForTrial,
    isAtLeastOneStoreEligibleForTrial,
} from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

export const useTrialEligibility = (
    storeActivations: Record<string, StoreActivation>,
    isOnEligiblePan: boolean,
    isCurrentUserTeamLead: boolean,
) => {
    const [canStartTrial, setCanStartTrial] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const trialExtensionPeriodInDays =
        useFlag<number>(FeatureFlagKey.AiShoppingAssistantTrialExtension, 0) ||
        0

    useEffect(() => {
        const checkEligibility = async () => {
            setIsLoading(true)
            try {
                const hasEligibleStoreForTrial =
                    await isAtLeastOneStoreEligibleForTrial(
                        storeActivations,
                        trialExtensionPeriodInDays,
                    )

                setCanStartTrial(
                    hasEligibleStoreForTrial &&
                        isOnEligiblePan &&
                        isCurrentUserTeamLead,
                )
            } catch (error) {
                console.error('Failed to check trial eligibility:', error)
                setCanStartTrial(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkEligibility()
    }, [
        storeActivations,
        isOnEligiblePan,
        isCurrentUserTeamLead,
        trialExtensionPeriodInDays,
    ])

    const trialMilestone = useSalesTrialRevampMilestone()
    const isTrialRevampEnabled = trialMilestone !== 'off'
    useEffect(() => {
        // Disable the old trial implementation in case the revamp flag is activated
        if (isTrialRevampEnabled) {
            setCanStartTrial(false)
        }
    }, [isTrialRevampEnabled])

    return { canStartTrial, isLoading }
}

export const useTrialEligibilityForManualActivationFromFeatureFlag = (
    storeActivations: Record<string, StoreActivation>,
    isOnEligiblePan: boolean,
    isCurrentUserTeamLead: boolean,
) => {
    const [canStartTrial, setCanStartTrial] = useState(false)

    const isAiShoppingAssistantTrialMerchantsEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantTrialMerchants,
    )
    const trialExtensionPeriodInDays =
        useFlag<number>(FeatureFlagKey.AiShoppingAssistantTrialExtension, 0) ||
        0

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const hasEligibleStoreForTrial =
                    getStoresEligibleForTrial(
                        storeActivations,
                        trialExtensionPeriodInDays,
                    ).length > 0
                setCanStartTrial(
                    hasEligibleStoreForTrial &&
                        isCurrentUserTeamLead &&
                        isOnEligiblePan &&
                        isAiShoppingAssistantTrialMerchantsEnabled,
                )
            } catch (error) {
                console.error('Failed to check trial eligibility:', error)
            }
        }

        checkEligibility()
    }, [
        storeActivations,
        isOnEligiblePan,
        isAiShoppingAssistantTrialMerchantsEnabled,
        isCurrentUserTeamLead,
        trialExtensionPeriodInDays,
    ])

    return { canStartTrial }
}
