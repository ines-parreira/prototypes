import type {
    AiAgentPlaygroundOptions,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'

import type { PlaygroundChannels, PlaygroundCustomer } from '../types'

/**
 * Builds the offlineEvalSettings payload for creating an offline evaluation session
 * Uses DEFAULT_PLAYGROUND_CUSTOMER as fallback if no customer is provided
 */
export const buildOfflineEvalPayload = ({
    customer,
    storeData,
    gorgiasDomain,
    channel,
    areActionsAllowedToExecute,
}: {
    customer: PlaygroundCustomer
    storeData: StoreConfiguration
    gorgiasDomain: string
    channel: PlaygroundChannels
    areActionsAllowedToExecute: boolean
}): AiAgentPlaygroundOptions => {
    const customerId = customer.id ?? DEFAULT_PLAYGROUND_CUSTOMER.id
    const customerName = customer.name ?? DEFAULT_PLAYGROUND_CUSTOMER.name

    return {
        areActionsAllowedToExecute,
        offlineEvalSettings: {
            app: {
                evaluatedUseCase: 'chat-customer-support',
                shopName: storeData.storeName,
                shopType: storeData.shopType,
                gorgiasDomain,
            },
            user: {
                id: customerId.toString(),
                name: customerName!,
            },
            session: {
                channel,
            },
        },
    }
}
