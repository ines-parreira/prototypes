import React, { createContext, useContext } from 'react'

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
    const { integrations, isLoading } = useAllIntegrations('shopify')
    return (
        <IntegrationsContext.Provider value={{ integrations, isLoading }}>
            {children}
        </IntegrationsContext.Provider>
    )
}

export const useIntegrations = () => {
    const ctx = useContext(IntegrationsContext)
    if (!ctx)
        throw new Error(
            'useIntegrations must be used within IntegrationsProvider',
        )
    return ctx
}
