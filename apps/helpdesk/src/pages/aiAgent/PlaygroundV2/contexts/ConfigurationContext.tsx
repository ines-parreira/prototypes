import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useAiAgentHttpIntegration } from '../hooks/useAiAgentHttpIntegration'
import { usePlaygroundResources } from '../hooks/usePlaygroundResources'
import { useShopNameResolution } from '../hooks/useShopNameResolution'

type ConfigurationContextValue = {
    storeConfiguration: StoreConfiguration | null
    accountConfiguration: {
        httpIntegration?: { id: number }
        gorgiasDomain: string
        accountId: number
    } | null
    snippetHelpCenterId: number | undefined
    httpIntegrationId: number
    baseUrl: string
    gorgiasDomain: string
    accountId: number
    chatIntegrationId: number | undefined
    smsIntegrationId: number | undefined
    shopName: string
}

const ConfigurationContext = createContext<
    ConfigurationContextValue | undefined
>(undefined)

export const useConfigurationContext = () => {
    const context = useContext(ConfigurationContext)
    if (!context) {
        throw new Error(
            'usePlaygroundConfigurationContext must be used within PlaygroundConfigurationProvider',
        )
    }
    return context
}

type ConfigurationProviderProps = {
    children: ReactNode
    shopName?: string
}

export const ConfigurationProvider = ({
    children,
    shopName: propsShopName,
}: ConfigurationProviderProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { resolvedShopName: shopNameFromIntegration } =
        useShopNameResolution(propsShopName)

    const {
        storeConfiguration,
        accountConfiguration,
        snippetHelpCenterId,
        isLoading,
    } = usePlaygroundResources({
        shopName: shopNameFromIntegration,
        accountDomain,
    })

    const shopName =
        storeConfiguration?.storeName || shopNameFromIntegration || ''

    const { httpIntegrationId, baseUrl } = useAiAgentHttpIntegration()

    const initializedHttpIntegrationId =
        httpIntegrationId || accountConfiguration?.httpIntegration?.id || 0
    const gorgiasDomain = accountConfiguration?.gorgiasDomain || ''
    const accountId = accountConfiguration?.accountId || 0
    const chatIntegrationId = storeConfiguration?.monitoredChatIntegrations?.[0]
    const smsIntegrationId = storeConfiguration?.monitoredSmsIntegrations?.[0]

    const contextValue = useMemo(
        () => ({
            storeConfiguration: storeConfiguration || null,
            accountConfiguration: accountConfiguration || null,
            snippetHelpCenterId,
            httpIntegrationId: initializedHttpIntegrationId,
            baseUrl,
            gorgiasDomain,
            accountId,
            chatIntegrationId,
            smsIntegrationId,
            shopName,
        }),
        [
            storeConfiguration,
            accountConfiguration,
            snippetHelpCenterId,
            initializedHttpIntegrationId,
            baseUrl,
            gorgiasDomain,
            accountId,
            chatIntegrationId,
            smsIntegrationId,
            shopName,
        ],
    )

    return (
        <ConfigurationContext.Provider value={contextValue}>
            {isLoading ? <LoadingSpinner /> : children}
        </ConfigurationContext.Provider>
    )
}
