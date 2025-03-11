import { useMemo } from 'react'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'

const computeActivationScore = (
    storeConfigs: StoreConfigurationForActivation[],
): { currentScore: number; totalScore: number } => {
    const totalStores = storeConfigs.length
    const totalScore = totalStores * 3

    const currentScore = storeConfigs.reduce((score, config) => {
        let storeScore = 0
        if (config.scopes.includes(AiAgentScope.Sales)) storeScore += 1
        if (config.scopes.includes(AiAgentScope.Support)) {
            if (!config.chatChannelDeactivatedDatetime) storeScore += 1
            if (!config.emailChannelDeactivatedDatetime) storeScore += 1
        }
        return score + storeScore
    }, 0)

    return {
        currentScore,
        totalScore,
    }
}

export type StoreConfigurationForActivation = Pick<
    StoreConfiguration,
    | 'storeName'
    | 'scopes'
    | 'chatChannelDeactivatedDatetime'
    | 'emailChannelDeactivatedDatetime'
    | 'monitoredChatIntegrations'
    | 'monitoredEmailIntegrations'
>
export const useStoreActivations = ({
    storeConfigurations,
}: {
    storeConfigurations: StoreConfigurationForActivation[]
}): {
    storeActivations: StoreActivation[]
    score: { currentScore: number; totalScore: number }
} => {
    const storeActivations = useMemo(() => {
        return storeConfigurations.map((storeConfiguration) => {
            const isChatEnabled =
                storeConfiguration.scopes.includes(AiAgentScope.Support) &&
                !storeConfiguration.chatChannelDeactivatedDatetime
            const isEmailEnabled =
                storeConfiguration.scopes.includes(AiAgentScope.Support) &&
                !storeConfiguration.emailChannelDeactivatedDatetime

            return {
                name: storeConfiguration.storeName,
                title: storeConfiguration.storeName,
                support: {
                    enabled: isChatEnabled || isEmailEnabled,
                    chat: {
                        enabled: isChatEnabled,
                        isIntegrationMissing:
                            !storeConfiguration.monitoredChatIntegrations
                                .length,
                    },
                    email: {
                        enabled: isEmailEnabled,
                        isIntegrationMissing:
                            !storeConfiguration.monitoredEmailIntegrations
                                .length,
                    },
                },
                sales: {
                    enabled: storeConfiguration.scopes.includes(
                        AiAgentScope.Sales,
                    ),
                    isDisabled: !isChatEnabled,
                },
            }
        })
    }, [storeConfigurations])

    return {
        storeActivations,
        score: computeActivationScore(storeConfigurations),
    }
}
