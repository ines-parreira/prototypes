import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'

import {
    buildKnowledgeOverrideRules,
    buildOfflineEvalPayload,
} from '../offline-eval-payload.utils'

const defaultStoreData = {
    storeName: 'Test Store',
    shopType: 'shopify',
} as any

const defaultCustomer = {
    id: 42,
    name: 'Jane Doe',
    email: 'jane@example.com',
}

describe('buildKnowledgeOverrideRules', () => {
    it('returns an empty array when draftKnowledge is undefined', () => {
        expect(buildKnowledgeOverrideRules(undefined)).toEqual([])
    })

    it('returns a knowledge override rule when draftKnowledge is provided', () => {
        const result = buildKnowledgeOverrideRules({
            sourceId: 123,
            sourceSetId: 456,
        })

        expect(result).toEqual([
            {
                name: 'overridesLiveKnowledgeWithDraftKnowledge',
                knowledge: [{ sourceId: 123, sourceSetId: 456 }],
            },
        ])
    })
})

describe('buildOfflineEvalPayload', () => {
    it('includes areActionsAllowedToExecute and base offlineEvalSettings', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: true,
        })

        expect(result.areActionsAllowedToExecute).toBe(true)
        expect(result.offlineEvalSettings).toMatchObject({
            app: {
                evaluatedUseCase: 'chat-customer-support',
                shopName: 'Test Store',
                gorgiasDomain: 'acme',
            },
            user: { id: '42', name: 'Jane Doe' },
            session: { channel: 'email' },
        })
    })

    it('does not include knowledgeOverrideRules when draftKnowledge is not provided', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings).not.toHaveProperty(
            'knowledgeOverrideRules',
        )
    })

    it('includes knowledgeOverrideRules when draftKnowledge is provided', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: false,
            draftKnowledge: { sourceId: 7, sourceSetId: 8 },
        })

        expect(result.offlineEvalSettings?.knowledgeOverrideRules).toEqual([
            {
                name: 'overridesLiveKnowledgeWithDraftKnowledge',
                knowledge: [{ sourceId: 7, sourceSetId: 8 }],
            },
        ])
    })

    it('includes chatConfig when provided', () => {
        const chatConfig = {
            availability: 'online' as const,
            integrationId: 789,
        }
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'chat',
            areActionsAllowedToExecute: false,
            chatConfig,
        })

        expect(result.offlineEvalSettings?.chatConfig).toEqual(chatConfig)
    })

    it('chatConfig is undefined when not provided', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.chatConfig).toBeUndefined()
    })

    it('falls back to DEFAULT_PLAYGROUND_CUSTOMER when customer has no id or name', () => {
        const result = buildOfflineEvalPayload({
            customer: { email: 'anonymous@example.com' } as any,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.user).toEqual({
            id: DEFAULT_PLAYGROUND_CUSTOMER.id.toString(),
            name: DEFAULT_PLAYGROUND_CUSTOMER.name,
        })
    })
})
