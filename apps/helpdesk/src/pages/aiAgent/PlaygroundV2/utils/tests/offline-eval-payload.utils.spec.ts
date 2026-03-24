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
                evaluatedUseCase: 'gorgias-email',
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

    it('includes smsConfig when provided', () => {
        const smsConfig = { integrationId: 42 }
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'sms',
            areActionsAllowedToExecute: false,
            smsConfig,
        })

        expect(result.offlineEvalSettings?.smsConfig).toEqual(smsConfig)
    })

    it('smsConfig is undefined when not provided', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'sms',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.smsConfig).toBeUndefined()
    })

    it.each([
        ['email', 'gorgias-email'],
        ['sms', 'gorgias-sms'],
        ['chat', 'gorgias-chat'],
    ] as const)(
        'sets evaluatedUseCase to "%s" for channel "%s"',
        (channel, expectedUseCase) => {
            const result = buildOfflineEvalPayload({
                customer: defaultCustomer,
                storeData: defaultStoreData,
                gorgiasDomain: 'acme',
                channel,
                areActionsAllowedToExecute: false,
            })

            expect(result.offlineEvalSettings?.app.evaluatedUseCase).toBe(
                expectedUseCase,
            )
        },
    )

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
            email: 'anonymous@example.com',
        })
    })

    it('includes email in user when customer has email', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.user.email).toBe('jane@example.com')
    })

    it('includes phoneNumber in user when customer has phoneNumber', () => {
        const result = buildOfflineEvalPayload({
            customer: { ...defaultCustomer, phoneNumber: '+15551234567' },
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'sms',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.user.phoneNumber).toBe(
            '+15551234567',
        )
    })

    it('does not include email in user when customer email is empty', () => {
        const result = buildOfflineEvalPayload({
            customer: { ...defaultCustomer, email: '' },
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'sms',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.user).not.toHaveProperty('email')
    })

    it('does not include phoneNumber in user when customer phoneNumber is not provided', () => {
        const result = buildOfflineEvalPayload({
            customer: defaultCustomer,
            storeData: defaultStoreData,
            gorgiasDomain: 'acme',
            channel: 'email',
            areActionsAllowedToExecute: false,
        })

        expect(result.offlineEvalSettings?.user).not.toHaveProperty(
            'phoneNumber',
        )
    })
})
