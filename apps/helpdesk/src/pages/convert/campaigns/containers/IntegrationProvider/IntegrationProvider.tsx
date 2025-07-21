import React, { ReactNode } from 'react'

import { Map } from 'immutable'

import {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'

import IntegrationContext from './context'

type Props = {
    children: ReactNode
    shopifyIntegration: Map<any, any>
    chatIntegration: Map<any, any>
}

export const IntegrationProvider = ({
    children,
    shopifyIntegration,
    chatIntegration,
}: Props) => {
    return (
        <IntegrationContext.Provider
            value={{
                shopifyIntegration:
                    shopifyIntegration.toJS() as ShopifyIntegration,
                chatIntegration:
                    chatIntegration.toJS() as GorgiasChatIntegration,
            }}
        >
            {children}
        </IntegrationContext.Provider>
    )
}
