import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    storeConfigurationKeys,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import { AiAgentScope } from 'models/aiAgent/types'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useSalesTrialRevampMilestone } from './useSalesTrialRevampMilestone'

type Params = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
}

const TRIAL_DURATION = 14 * 24 * 60 * 60 * 1000

class InvalidChatError extends Error {
    public readonly name = 'InvalidChatError'
}
class InvalidKnowledgeError extends Error {
    public readonly name = 'InvalidKnowledgeError'
}

export const useStartShoppingAssistantTrial = ({
    onError,
}: {
    onError?: () => void
}) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const queryClient = useQueryClient()

    const milestone = useSalesTrialRevampMilestone()

    const startSalesTrialMutation = useStartSalesTrialMutation()

    return useMutation<void, Error, Params>(
        // Ideally this should take only a single storeActivation as parameter so that we could remove the protective check on stores.length === 1
        async ({ accountDomain, storeActivations }) => {
            const store = getSingleStoreOrThrow(storeActivations)

            // Check if the store has a valid chat integration
            const isChatValid =
                store.support.chat.availableChats &&
                store.support.chat.availableChats.length > 0 &&
                !store.support.chat.isIntegrationMissing &&
                !store.support.chat.isInstallationMissing
            if (!isChatValid) {
                throw new InvalidChatError()
            }

            const isKnowledgeValid = !store.isMissingKnowledge
            if (!isKnowledgeValid) {
                throw new InvalidKnowledgeError()
            }

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
            onError: (error, { storeActivations }) => {
                const store = getSingleStoreOrThrow(storeActivations)
                const routes = getAiAgentNavigationRoutes(store.name)
                if (error instanceof InvalidChatError) {
                    dispatch(
                        notify({
                            message:
                                'You need at least 1 valid chat integration to be able to start the Shopping Assistant Trial.',
                            status: NotificationStatus.Warning,
                        }),
                    )
                    history.push(routes.deployChat)
                } else if (error instanceof InvalidKnowledgeError) {
                    dispatch(
                        notify({
                            message:
                                'You need at least 1 valid knowledge source to be able to start the Shopping Assistant Trial.',
                            status: NotificationStatus.Warning,
                        }),
                    )
                    history.push(routes.knowledge)
                } else {
                    void dispatch(
                        notify({
                            message:
                                'Failed to start the shopping assistant trial. Please try again.',
                            status: NotificationStatus.Error,
                        }),
                    )
                }

                onError?.()
            },
        },
    )
}

const getSingleStoreOrThrow = (
    storeActivations: Record<string, StoreActivation>,
) => {
    const stores = Object.values(storeActivations)
    if (stores.length !== 1) {
        throw new Error(
            'Unexpected case: Should be in the context of a specific store to start the trial on it.',
        )
    }

    return stores[0]
}
