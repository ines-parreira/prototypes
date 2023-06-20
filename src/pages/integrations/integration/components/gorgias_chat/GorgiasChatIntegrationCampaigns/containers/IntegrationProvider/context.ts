import {createContext} from 'react'

import {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'

type IntegrationContextModel = {
    shopifyIntegration?: ShopifyIntegration
    chatIntegration?: GorgiasChatIntegration
}

const IntegrationContext = createContext<IntegrationContextModel>({})

export default IntegrationContext
