import { useEffect, useState } from 'react'

import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { isAtLeastOneStoreEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

export const useTrialEligibility = (
    storeActivations: Record<string, StoreActivation>,
    isOnUsd5Plan: boolean,
    isCurrentUserTeamLead: boolean,
) => {
    const [canStartTrial, setCanStartTrial] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkEligibility = async () => {
            setIsLoading(true)
            try {
                const result =
                    await isAtLeastOneStoreEligibleForTrial(storeActivations)

                setCanStartTrial(
                    result && isOnUsd5Plan && isCurrentUserTeamLead,
                )
            } catch (error) {
                console.error('Failed to check trial eligibility:', error)
                setCanStartTrial(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkEligibility()
    }, [storeActivations, isOnUsd5Plan, isCurrentUserTeamLead])

    return { canStartTrial, isLoading }
}
