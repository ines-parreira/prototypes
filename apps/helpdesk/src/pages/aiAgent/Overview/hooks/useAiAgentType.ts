import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { AiAgentScope } from 'models/aiAgent/types'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getStoreIntegrations } from 'state/integrations/selectors'

export type AiAgentType = 'sales' | 'support' | 'mixed' | 'overview'
export const getAiAgentTypeFromScopes = (
    scopes?: AiAgentScope[],
): AiAgentType | undefined => {
    if (!scopes?.length) {
        return undefined
    }

    if (
        scopes.includes(AiAgentScope.Support) &&
        scopes.includes(AiAgentScope.Sales)
    ) {
        return 'mixed'
    }

    if (scopes.includes(AiAgentScope.Sales)) {
        return 'sales'
    }

    return 'support'
}

export const useAiAgentTypeForAccount = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const stores = useAppSelector(getStoreIntegrations)
    const storesName = useMemo(
        () => stores.map((store) => store.name),
        [stores],
    )

    const { isLoading, storeConfigurations } = useStoreConfigurationForAccount({
        accountDomain,
        storesName,
    })

    // Get a deduplicated list of scopes
    const scopes: AiAgentScope[] = Array.from(
        new Set(
            storeConfigurations
                ?.map((sc) => sc.scopes)
                .reduce((allScopes, currentScopes) => {
                    allScopes.push(...currentScopes)
                    return allScopes
                }, []) ?? [],
        ),
    )

    return {
        isLoading,
        aiAgentType: getAiAgentTypeFromScopes(scopes),
    }
}
