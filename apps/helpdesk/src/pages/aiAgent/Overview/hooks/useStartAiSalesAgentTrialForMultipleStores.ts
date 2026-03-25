import { useMutation } from '@tanstack/react-query'

import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import { AiAgentScope } from 'models/aiAgent/types'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

type Params = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
}

const TRIAL_DURATION = 14 * 24 * 60 * 60 * 1000

/**
 * @deprecated Use {@link useStartShoppingAssistantTrial} instead
 */
export const useStartAiSalesAgentTrialForMultipleStores = () => {
    return useMutation<void, Error, Params>(
        async ({ accountDomain, storeActivations }) => {
            const storesEligibleForTrial = Object.values(
                storeActivations,
            ).filter(
                (storeActivation) =>
                    !storeActivation.support.chat.isIntegrationMissing,
            )

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
