import { useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import { storeConfigurationKeys } from 'models/aiAgent/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
import { useStartAiSalesAgentTrialForMultipleStores } from 'pages/aiAgent/Overview/hooks/useStartAiSalesAgentTrialForMultipleStores'
import { getShopNameFromStoreActivations } from 'pages/aiAgent/utils/getShopNameFromStoreActivations'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

import { StoreActivation } from './storeActivationReducer'

type AIAgentTrialType = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
    onSuccess: () => void
}

export const useActivateAiAgentTrial = ({
    accountDomain,
    storeActivations,
    onSuccess,
}: AIAgentTrialType) => {
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentUser = useAppSelector(getCurrentUser)

    const queryClient = useQueryClient()
    const { mutateAsync: triggerTrialMutation, isLoading } =
        useStartAiSalesAgentTrialForMultipleStores()
    const shopName = useMemo(
        () => getShopNameFromStoreActivations(storeActivations),
        [storeActivations],
    )
    const { routes } = useAiAgentNavigation({ shopName })

    const isOnUsd5Plan = currentAutomatePlan?.generation === 5
    const isCurrentUserTeamLead = isTeamLead(currentUser)
    const { canStartTrial, isLoading: isTrialLoading } = useTrialEligibility(
        storeActivations,
        isOnUsd5Plan,
        isCurrentUserTeamLead,
    )

    const { canStartTrial: canStartTrialFromFeatureFlag } =
        useTrialEligibilityForManualActivationFromFeatureFlag(
            storeActivations,
            isOnUsd5Plan,
            isCurrentUserTeamLead,
        )

    const startTrial = () => {
        triggerTrialMutation(
            {
                accountDomain,
                storeActivations,
            },
            {
                onSuccess: () => {
                    // Refresh the store activations cache
                    queryClient.invalidateQueries({
                        queryKey: storeConfigurationKeys.all(),
                    })

                    onSuccess()
                },
            },
        )
    }

    return {
        startTrial,
        isLoading: isLoading || isTrialLoading,
        routes,
        canStartTrial,
        canStartTrialFromFeatureFlag,
        shopName,
    }
}
