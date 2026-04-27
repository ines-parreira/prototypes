import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { SkillTemplatesData, useSkillsTemplates } from './useSkillsTemplates'

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterArticleList: jest.fn(),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetHelpCenterArticleList = useGetHelpCenterArticleList as jest.Mock

describe('useSkillsTemplates', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) =>
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

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            isError: false,
        })
    })

    it('should return all skill templates in allSkillsTemplates', () => {
        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        expect(result.current.allSkillsTemplates).toHaveLength(
            SkillTemplatesData.length,
        )
    })

    it('should return all available skill templates in availableSkillsTemplates when none are created', () => {
        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        expect(result.current.availableSkillsTemplates).toHaveLength(
            SkillTemplatesData.length,
        )
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
            'Subscription cancellations',
            'WHEN: The customer asks to cancel their subscription',
        ],
    ])('should map "%s" to guidance "%s"', (skillName, guidanceName) => {
        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        const template = result.current.allSkillsTemplates.find(
            (t) => t.name === skillName,
        )

        expect(template?.guidance?.name).toBe(guidanceName)
    })

    it('should default intent status to not_linked', () => {
        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        const template = result.current.allSkillsTemplates.find(
            (t) => t.name === 'Order cancellations',
        )
        const intent = template?.intents.find((i) => i.name === 'order::cancel')

        expect(intent?.status).toBe('not_linked')
    })

    it('returns all templates as available when the article list data is undefined', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsTemplates(), { wrapper })

        expect(result.current.availableSkillsTemplates).toHaveLength(
            SkillTemplatesData.length,
        )
    })

    describe('missing store configuration', () => {
        it('falls back to 0 help_center_id on intents when storeConfiguration is undefined', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: false,
                storeConfiguration: undefined,
            })

            const { result } = renderHook(() => useSkillsTemplates(), {
                wrapper,
            })

            const template = result.current.allSkillsTemplates[0]
            expect(template?.intents[0]?.help_center_id).toBe(0)
        })

        it('falls back to 0 help_center_id on intents when guidanceHelpCenterId is missing', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: false,
                storeConfiguration: {},
            })

            const { result } = renderHook(() => useSkillsTemplates(), {
                wrapper,
            })

            const template = result.current.allSkillsTemplates[0]
            expect(template?.intents[0]?.help_center_id).toBe(0)
        })
    })

    describe('template filtering (already created templates)', () => {
        it('should filter out a template from availableSkillsTemplates when its id matches a template_key in an article', () => {
            mockUseGetHelpCenterArticleList.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            template_key:
                                'template_skill_order-status-tracking-or-delivery-timing',
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useSkillsTemplates(), {
                wrapper,
            })

            expect(
                result.current.availableSkillsTemplates.find(
                    (t) => t.id === 'order-status-tracking-or-delivery-timing',
                ),
            ).toBeUndefined()
            expect(result.current.availableSkillsTemplates).toHaveLength(
                SkillTemplatesData.length - 1,
            )
            expect(result.current.allSkillsTemplates).toHaveLength(
                SkillTemplatesData.length,
            )
        })

        it('should include a template in availableSkillsTemplates when no article has a matching template_key', () => {
            mockUseGetHelpCenterArticleList.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            template_key: null,
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useSkillsTemplates(), {
                wrapper,
            })

            expect(result.current.availableSkillsTemplates).toHaveLength(
                SkillTemplatesData.length,
            )
        })

        it('should only filter templates whose id matches a template_key', () => {
            mockUseGetHelpCenterArticleList.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 2,
                            template_key: 'template_skill_order-cancellations',
                        },
                    ],
                },
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() => useSkillsTemplates(), {
                wrapper,
            })

            expect(
                result.current.availableSkillsTemplates.find(
                    (t) => t.id === 'order-cancellations',
                ),
            ).toBeUndefined()
            expect(
                result.current.availableSkillsTemplates.find(
                    (t) => t.id === 'order-status-tracking-or-delivery-timing',
                ),
            ).toBeDefined()
            expect(result.current.availableSkillsTemplates).toHaveLength(
                SkillTemplatesData.length - 1,
            )
        })
    })
})
