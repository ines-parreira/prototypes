import type {
    AiAgentPlaygroundOptions,
    ChatConfig,
    KnowledgeOverrideRule,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'

import type {
    DraftKnowledge,
    PlaygroundChannels,
    PlaygroundCustomer,
} from '../types'

export const buildKnowledgeOverrideRules = (
    draftKnowledge: DraftKnowledge | undefined,
): KnowledgeOverrideRule[] => {
    if (!draftKnowledge) return []

    return [
        {
            name: 'overridesLiveKnowledgeWithDraftKnowledge',
            knowledge: [
                {
                    sourceId: draftKnowledge.sourceId,
                    sourceSetId: draftKnowledge.sourceSetId,
                },
            ],
        },
    ]
}

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
    draftKnowledge,
    chatConfig,
}: {
    customer: PlaygroundCustomer
    storeData: StoreConfiguration
    gorgiasDomain: string
    channel: PlaygroundChannels
    areActionsAllowedToExecute: boolean
    draftKnowledge?: DraftKnowledge
    chatConfig?: ChatConfig
}): AiAgentPlaygroundOptions => {
    const customerId = customer.id ?? DEFAULT_PLAYGROUND_CUSTOMER.id
    const customerName = customer.name ?? DEFAULT_PLAYGROUND_CUSTOMER.name
    const knowledgeOverrideRules = buildKnowledgeOverrideRules(draftKnowledge)

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
            ...(knowledgeOverrideRules.length > 0 && {
                knowledgeOverrideRules,
            }),
            chatConfig: chatConfig,
        },
    }
}
