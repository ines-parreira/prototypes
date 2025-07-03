import { useMutation } from '@tanstack/react-query'

import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import { AiAgentScope } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'

type Params = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
}

const TRIAL_DURATION = 14 * 24 * 60 * 60 * 1000

export const useStartShoppingAssistantTrial = () => {
    return useMutation<void, Error, Params>(
        async ({ accountDomain, storeActivations }) => {
            // TODO: check if the store has a trial already active
            const storesEligibleForTrial = Object.values(storeActivations)

            await Promise.all(
                storesEligibleForTrial.map((storeActivation) =>
                    upsertStoreConfiguration(accountDomain, {
                        ...storeActivation.configuration,
                        scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                        salesDeactivatedDatetime: new Date(
                            Date.now() + TRIAL_DURATION,
                        ).toISOString(),
                        salesPersuasionLevel: PersuasionLevel.Educational,
                        salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
                        salesDiscountMax: null,
                        chatChannelDeactivatedDatetime: null,
                    }),
                ),
            )
        },
    )
}
