import { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
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

    useEffect(() => {
        const checkEligibility = async () => {
            setIsLoading(true)
            try {
                const hasEligibleStoreForTrial =
                    await isAtLeastOneStoreEligibleForTrial(storeActivations)

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
    }, [storeActivations, isOnEligiblePan, isCurrentUserTeamLead])

    const isTrialRevampEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialRevamp,
    )
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

    const isAiShoppingAssistantTrialMerchantsEnabled =
        useFlags()[FeatureFlagKey.AiShoppingAssistantTrialMerchants]

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const hasEligibleStoreForTrial =
                    getStoresEligibleForTrial(storeActivations).length > 0
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
    ])

    return { canStartTrial }
}
