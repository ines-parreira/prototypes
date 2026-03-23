import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useListIntents } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { SkillTemplatesData, useSkillsTemplates } from './useSkillsTemplates'

jest.mock('models/helpCenter/queries', () => ({
    useListIntents: jest.fn(),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseListIntents = useListIntents as jest.Mock

describe('useSkillsTemplates', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) =>
        QueryClientProvider({ client: queryClient, children })

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: { intents: [] },
            isLoading: false,
            isError: false,
        })
    })

    it('should return all skill templates', () => {
        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        expect(result.current).toHaveLength(SkillTemplatesData.length)
    })

    it.each([
        [
            'Order status, tracking or delivery timing',
            'WHEN: The customer asks about order status, tracking, or delivery timing',
        ],
        [
            'One or more items missing from an order',
            'WHEN: The customer reports that one or more items are missing from their order',
        ],
        ['Order cancellations', 'WHEN: The customer asks to cancel an order'],
        [
            'Shipping address updates or edits in an order',
            'WHEN: The customer asks to edit or update the shipping address for an order',
        ],
        [
            'Product edits in an order (replace product, remove product)',
            'WHEN: The customer asks to edit the products in an order',
        ],
        [
            'Item is damaged, defective, broken or not working as expected',
            'WHEN: The customer reports that an item is damaged, defective, broken, or not working as expected',
        ],
        [
            'Returns and exchanges',
            'WHEN: The customer asks about a return, exchange, or refund status',
        ],
        [
            'Promo codes and free shipping',
            'WHEN: The customer asks about promo codes or free shipping',
        ],
        [
            'Subscription modification (pause, skip, resume)',
            'WHEN: The customer asks to modify their subscription (pause, skip or resume)',
        ],
        [
            'Subscription cancellations',
            'WHEN: The customer asks to cancel their subscription',
        ],
    ])('should map "%s" to guidance "%s"', (skillName, guidanceName) => {
        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        const template = result.current.find((t) => t.name === skillName)

        expect(template?.guidance?.name).toBe(guidanceName)
    })

    it('should set intent status to linked when API returns linked intent', () => {
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: 'linked',
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        const template = result.current.find(
            (t) => t.name === 'Order status, tracking or delivery timing',
        )
        const intent = template?.intents.find((i) => i.name === 'order::status')

        expect(intent?.status).toBe('linked')
    })

    it('should default intent status to not_linked when intent is not in API response', () => {
        mockUseListIntents.mockReturnValue({
            data: { intents: [] },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        const template = result.current.find(
            (t) => t.name === 'Order cancellations',
        )
        const intent = template?.intents.find((i) => i.name === 'order::cancel')

        expect(intent?.status).toBe('not_linked')
    })
})
