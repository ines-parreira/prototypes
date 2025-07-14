import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory } from 'react-router'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    storeConfigurationKeys,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import { AiAgentScope } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useSalesTrialRevampMilestone } from './useSalesTrialRevampMilestone'

type Params = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
}

const TRIAL_DURATION = 14 * 24 * 60 * 60 * 1000

export const useStartShoppingAssistantTrial = ({
    onError,
}: {
    onError?: () => void
}) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const flags = useFlags()
    const queryClient = useQueryClient()

    const milestone = useSalesTrialRevampMilestone()

    const startSalesTrialMutation = useStartSalesTrialMutation()

    return useMutation<void, Error, Params>(
        // Ideally this should take only a single storeActivation as parameter so that we could remove the protective check on stores.length === 1
        async ({ accountDomain, storeActivations }) => {
            const stores = Object.values(storeActivations)
            if (stores.length !== 1) {
                throw new Error(
                    'Unexpected case: Should be in the context of a specific store to start the trial on it.',
                )
            }

            const store = stores[0]

            const routes = getAiAgentNavigationRoutes(store.name, flags)

            // Check if the store has a valid chat integration
            const isChatValid =
                store.support.chat.availableChats &&
                store.support.chat.availableChats.length > 0 &&
                !store.support.chat.isIntegrationMissing &&
                !store.support.chat.isInstallationMissing

            if (!isChatValid) {
                dispatch(
                    notify({
                        message:
                            'You need at least 1 valid chat integration to be able to start the Shopping Assistant Trial.',
                        status: NotificationStatus.Warning,
                    }),
                )
                history.push(routes.settingsChannels)
                throw new Error("Invalid Chat - can't start trial")
            }

            // TODO: Add validation for "at least 1 knowledge sources"

            if (milestone === 'milestone-1') {
                await startSalesTrialMutation.mutateAsync([store.name])
            } else {
                await upsertStoreConfiguration(accountDomain, {
                    ...store.configuration,
                    scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                    salesDeactivatedDatetime: new Date(
                        Date.now() + TRIAL_DURATION,
                    ).toISOString(),
                    salesPersuasionLevel: PersuasionLevel.Educational,
                    salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
                    salesDiscountMax: null,
                    chatChannelDeactivatedDatetime: null,
                })
            }
        },
        {
            onSuccess: () => {
                // For non-milestone-1, invalidate store configurations.
                // For milestone-1, it's already done in the useStartSalesTrialMutation
                if (milestone !== 'milestone-1') {
                    // Refresh the store activations cache
                    queryClient.invalidateQueries({
                        queryKey: storeConfigurationKeys.all(),
                    })
                }
            },
            onError: () => {
                void dispatch(
                    notify({
                        message:
                            'Failed to start the shopping assistant trial. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
                onError?.()
            },
        },
    )
}
