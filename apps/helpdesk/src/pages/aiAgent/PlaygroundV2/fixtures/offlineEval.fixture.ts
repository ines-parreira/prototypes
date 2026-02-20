import type { AiAgentPlaygroundOptions } from 'models/aiAgent/types'

export const getOfflineEvalPayloadFixture = (
    overrides?: Partial<
        NonNullable<AiAgentPlaygroundOptions['offlineEvalSettings']>
    >,
): AiAgentPlaygroundOptions => ({
    areActionsAllowedToExecute: false,
    offlineEvalSettings: {
        app: {
            shopName: 'my-shop',
            shopType: 'shopify',
            gorgiasDomain: 'acme.io',
        },
        user: { id: '1', name: 'Alice' },
        session: { channel: 'chat' },
        ...overrides,
    },
})
