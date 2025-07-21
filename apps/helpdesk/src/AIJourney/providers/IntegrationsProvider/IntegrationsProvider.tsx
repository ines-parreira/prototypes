import React, { createContext, useContext, useMemo } from 'react'

import { Integration } from '@gorgias/helpdesk-types'

import useAllIntegrations from 'hooks/useAllIntegrations'

type IntegrationsContextType = {
    integrations: Integration[]
    isLoading: boolean
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(
    undefined,
)

export const IntegrationsProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { integrations, isLoading } = useAllIntegrations('shopify', {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })
    return (
        <IntegrationsContext.Provider value={{ integrations, isLoading }}>
            {children}
        </IntegrationsContext.Provider>
    )
}

export const useIntegrations = (shopName?: string) => {
    const ctx = useContext(IntegrationsContext)
    if (!ctx)
        throw new Error(
            'useIntegrations must be used within IntegrationsProvider',
        )
    const { integrations, isLoading: isLoadingIntegrations } = ctx

    const currentIntegration = useMemo(() => {
        if (isLoadingIntegrations) return undefined
        return integrations.find((i) => i.name === shopName)
    }, [integrations, shopName, isLoadingIntegrations])

    return {
        currentIntegration,
        integrations,
        isLoading: isLoadingIntegrations,
    }
}
