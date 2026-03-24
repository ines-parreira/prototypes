import type {
    AiAgentPlaygroundOptions,
    ChatConfig,
    KnowledgeOverrideRule,
    SmsConfig,
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
    smsConfig,
}: {
    customer: PlaygroundCustomer
    storeData: StoreConfiguration
    gorgiasDomain: string
    channel: PlaygroundChannels
    areActionsAllowedToExecute: boolean
    draftKnowledge?: DraftKnowledge
    chatConfig?: ChatConfig
    smsConfig?: SmsConfig
}): AiAgentPlaygroundOptions => {
    const customerId = customer.id ?? DEFAULT_PLAYGROUND_CUSTOMER.id
    const customerName = customer.name ?? DEFAULT_PLAYGROUND_CUSTOMER.name
    const knowledgeOverrideRules = buildKnowledgeOverrideRules(draftKnowledge)

    return {
        areActionsAllowedToExecute,
        offlineEvalSettings: {
            app: {
                evaluatedUseCase: `gorgias-${channel}`,
                shopName: storeData.storeName,
                shopType: storeData.shopType,
                gorgiasDomain,
            },
            user: {
                id: customerId.toString(),
                name: customerName!,
                ...(customer.email && { email: customer.email }),
                ...(customer.phoneNumber && {
                    phoneNumber: customer.phoneNumber,
                }),
            },
            session: {
                channel,
            },
            ...(knowledgeOverrideRules.length > 0 && {
                knowledgeOverrideRules,
            }),
            chatConfig: chatConfig,
            smsConfig: smsConfig,
        },
    }
}
