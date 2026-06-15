import { renderHook } from '@repo/testing'

import { Product } from 'routes/layout/productConfig'

import {
    buildCopilotPageContext,
    useCopilotPageContext,
} from './getCopilotPageContext'

describe('buildCopilotPageContext', () => {
    it.each([
        [Product.Inbox, 'Inbox', '/app/'],
        [Product.Settings, 'Settings', '/app/settings/macros'],
        [Product.Analytics, 'Analytics', '/app/analytics/overview'],
        [Product.Customers, 'Customers', '/app/customers'],
    ])(
        'returns app-wide context for %s without an aiAgentSection',
        (product, name, pathname) => {
            const context = buildCopilotPageContext(
                { id: product, name },
                pathname,
            )

            expect(context).toEqual({
                product,
                productName: name,
                pathname,
            })
            expect(context.aiAgentSection).toBeUndefined()
        },
    )

    it('attaches aiAgentSection on a deep AI Agent route', () => {
        const context = buildCopilotPageContext(
            { id: Product.AiAgent, name: 'AI Agent' },
            '/app/ai-agent/shopify/acme/skills',
        )

        expect(context).toEqual({
            product: Product.AiAgent,
            productName: 'AI Agent',
            pathname: '/app/ai-agent/shopify/acme/skills',
            aiAgentSection: 'skills',
        })
    })

    it('omits aiAgentSection at the AI Agent root', () => {
        const context = buildCopilotPageContext(
            { id: Product.AiAgent, name: 'AI Agent' },
            '/app/ai-agent',
        )

        expect(context.aiAgentSection).toBeUndefined()
    })

    it('omits aiAgentSection when an AI Agent route has no sub-section', () => {
        const context = buildCopilotPageContext(
            { id: Product.AiAgent, name: 'AI Agent' },
            '/app/ai-agent/shopify/acme',
        )

        expect(context.aiAgentSection).toBeUndefined()
    })
})

describe('useCopilotPageContext', () => {
    it('reflects a non-AI-Agent route', () => {
        const { result } = renderHook(() => useCopilotPageContext(), {
            initialEntries: ['/app/'],
        })

        expect(result.current()).toEqual({
            product: Product.Inbox,
            productName: 'Inbox',
            pathname: '/app/',
        })
    })

    it('resolves the section on an AI Agent route', () => {
        const { result } = renderHook(() => useCopilotPageContext(), {
            initialEntries: ['/app/ai-agent/shopify/acme/skills'],
        })

        expect(result.current()).toMatchObject({
            product: Product.AiAgent,
            pathname: '/app/ai-agent/shopify/acme/skills',
            aiAgentSection: 'skills',
        })
    })
})
