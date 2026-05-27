import type { GorgiasCopilotReference } from '@gorgias/copilot'

import { resolveReferenceRoute } from './routes'

describe('resolveReferenceRoute', () => {
    it.each([
        [{ type: 'ticket', id: 42 }, '/app/ticket/42'],
        [
            {
                type: 'guidance',
                id: 7,
                shopType: 'shopify',
                shopName: 'acme',
            },
            '/app/ai-agent/shopify/acme/knowledge/guidance/7',
        ],
        [
            {
                type: 'skill',
                id: 12,
                shopType: 'shopify',
                shopName: 'acme',
            },
            '/app/ai-agent/shopify/acme/skills/12',
        ],
        [
            {
                type: 'opportunity',
                id: 3,
                shopType: 'shopify',
                shopName: 'acme',
            },
            '/app/ai-agent/shopify/acme/opportunities/3',
        ],
        [
            {
                type: 'support-action',
                id: 'wf_abc',
                shopType: 'shopify',
                shopName: 'acme',
            },
            '/app/ai-agent/shopify/acme/actions/edit/wf_abc',
        ],
    ] as [GorgiasCopilotReference, string][])(
        'maps %j to %s',
        (reference, expected) => {
            expect(resolveReferenceRoute(reference)).toBe(expected)
        },
    )
})
