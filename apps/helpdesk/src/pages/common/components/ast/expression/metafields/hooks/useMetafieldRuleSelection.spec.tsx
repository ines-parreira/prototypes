import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { fromJS, List } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockListMetafieldDefinitionsHandler } from '@gorgias/helpdesk-mocks'
import type { MetafieldDefinition } from '@gorgias/helpdesk-types'

import { IntegrationType } from 'models/integration/constants'
import type { ShopifyIntegration } from 'models/integration/types'
import type { RuleItemActions } from 'pages/settings/rules/types'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'

import type { SyntaxTreeLeaves } from '../types'
import { useMetafieldRuleSelection } from './useMetafieldRuleSelection'

function createMockShopifyIntegration(
    overrides?: Partial<ShopifyIntegration>,
): ShopifyIntegration {
    return {
        id: 123,
        name: 'Test Store',
        type: IntegrationType.Shopify,
        created_datetime: '2024-01-01T00:00:00Z',
        deactivated_datetime: null,
        decoration: null,
        deleted_datetime: null,
        description: null,
        locked_datetime: null,
        mappings: null,
        updated_datetime: '2024-01-01T00:00:00Z',
        uri: '/api/integrations/123',
        user: { id: 1 },
        managed: false,
        meta: {
            oauth: {
                status: 'success',
                error: '',
                scope: 'read_products,write_products',
            },
            shop_name: 'test-store.myshopify.com',
            webhooks: [],
        },
        ...overrides,
    }
}

function createMockField(overrides?: Partial<Field>): Field {
    return {
        id: '1',
        key: 'test_key',
        name: 'Test Field',
        type: 'single_line_text_field',
        category: 'Customer',
        isVisible: true,
        ...overrides,
    }
}

function createMockMetafieldDefinition(
    overrides?: Partial<MetafieldDefinition>,
): MetafieldDefinition {
    return {
        id: '1',
        name: 'Test Field',
        type: 'single_line_text_field',
        namespace: 'custom',
        key: 'test_key',
        ownerType: 'Customer',
        isPinned: true,
        isVisible: true,
        ...overrides,
    }
}

function createSyntaxTreeLeaves(path: string[]): SyntaxTreeLeaves {
    return List(path)
}

const mockMetafieldDefinitions: MetafieldDefinition[] = [
    createMockMetafieldDefinition({
        id: '1',
        key: 'vip_status',
        name: 'VIP Status',
    }),
    createMockMetafieldDefinition({
        id: '2',
        key: 'loyalty_points',
        name: 'Loyalty Points',
        type: 'number_integer',
    }),
    createMockMetafieldDefinition({
        id: '3',
        key: 'is_verified',
        name: 'Is Verified',
        type: 'boolean',
    }),
]

const server = setupServer()

const mockListMetafieldDefinitions = mockListMetafieldDefinitionsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: mockMetafieldDefinitions,
        }),
)

const mockStore = configureMockStore([thunk])

const store = mockStore({
    currentAccount: fromJS({ id: 1 }),
    currentUser: fromJS({ id: 2 }),
})

describe('useMetafieldRuleSelection', () => {
    let queryClient: QueryClient
    let mockActions: RuleItemActions

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        mockActions = {
            modifyCodeAST: jest.fn(),
            getCondition: jest.fn(),
        }
        server.use(mockListMetafieldDefinitions.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    describe('selectMetafield callback', () => {
        it.each([
            { category: 'Customer' as const },
            { category: 'Order' as const },
            { category: 'DraftOrder' as const },
        ])(
            'generates correct expression for $category category',
            async ({ category }) => {
                const shopifyIntegrations = [
                    createMockShopifyIntegration({ id: 123 }),
                ]
                const field = createMockField({ key: 'test_field', category })

                const { result } = renderHook(
                    () =>
                        useMetafieldRuleSelection({
                            syntaxTreeLeaves: null,
                            actions: mockActions,
                            parent: List(['test', 'path']),
                            shopifyIntegrations,
                        }),
                    { wrapper },
                )

                const selectedStore = createMockShopifyIntegration({ id: 123 })
                act(() => {
                    result.current.setSelectedStore(selectedStore)
                })

                act(() => {
                    result.current.selectMetafield(field, category)
                })

                expect(mockActions.modifyCodeAST).toHaveBeenCalledTimes(1)
                const [parentArg, expressionArg] = (
                    mockActions.modifyCodeAST as jest.Mock
                ).mock.calls[0]

                expect(parentArg.toJS()).toEqual(['test', 'path'])
                expect(expressionArg).toBeDefined()

                expect(result.current.selectedMetafield).toEqual(field)
            },
        )

        it('returns early without calling modifyCodeAST when no selectedStore', async () => {
            const shopifyIntegrations = [createMockShopifyIntegration()]
            const field = createMockField()

            const { result } = renderHook(
                () =>
                    useMetafieldRuleSelection({
                        syntaxTreeLeaves: null,
                        actions: mockActions,
                        parent: List([]),
                        shopifyIntegrations,
                    }),
                { wrapper },
            )

            act(() => {
                result.current.selectMetafield(field, 'Customer')
            })

            expect(mockActions.modifyCodeAST).not.toHaveBeenCalled()
        })
    })

    describe('useEffect: selectedStore from integrationIdFromTree', () => {
        it.each([
            {
                scenario: 'sets store when match found and no selectedStore',
                integrationId: 123,
                storeExists: true,
                shouldSetStore: true,
            },
            {
                scenario: 'does not set store when no match found',
                integrationId: 999,
                storeExists: false,
                shouldSetStore: false,
            },
        ])(
            '$scenario',
            async ({ integrationId, storeExists, shouldSetStore }) => {
                const shopifyIntegrations = storeExists
                    ? [
                          createMockShopifyIntegration({
                              id: integrationId,
                              name: 'Auto-Set Store',
                          }),
                      ]
                    : [
                          createMockShopifyIntegration({
                              id: 111,
                              name: 'Other Store',
                          }),
                      ]

                const syntaxTreeLeaves = createSyntaxTreeLeaves([
                    'ticket',
                    'customer',
                    'integrations',
                    'shopify',
                    'stores',
                    String(integrationId),
                    'customer',
                    'metafields',
                    'key',
                ])

                const { result } = renderHook(
                    () =>
                        useMetafieldRuleSelection({
                            syntaxTreeLeaves,
                            actions: mockActions,
                            parent: List([]),
                            shopifyIntegrations,
                        }),
                    { wrapper },
                )

                await waitFor(() => {
                    if (shouldSetStore) {
                        expect(result.current.selectedStore?.id).toBe(
                            integrationId,
                        )
                    } else {
                        expect(result.current.selectedStore).toBeNull()
                    }
                })
            },
        )

        it('does not override existing selectedStore', async () => {
            const shopifyIntegrations = [
                createMockShopifyIntegration({
                    id: 123,
                    name: 'Store From Tree',
                }),
                createMockShopifyIntegration({
                    id: 456,
                    name: 'Manually Selected Store',
                }),
            ]

            const syntaxTreeLeaves = createSyntaxTreeLeaves([
                'ticket',
                'customer',
                'integrations',
                'shopify',
                'stores',
                '123',
                'customer',
                'metafields',
                'key',
            ])

            const { result, rerender } = renderHook(
                () =>
                    useMetafieldRuleSelection({
                        syntaxTreeLeaves,
                        actions: mockActions,
                        parent: List([]),
                        shopifyIntegrations,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.selectedStore?.id).toBe(123)
            })

            const manuallySelectedStore = shopifyIntegrations[1]
            act(() => {
                result.current.setSelectedStore(manuallySelectedStore)
            })

            expect(result.current.selectedStore?.id).toBe(456)

            rerender()

            expect(result.current.selectedStore?.id).toBe(456)
        })
    })

    describe('useEffect: selectedMetafield from metafieldKeyFromTree', () => {
        it.each([
            {
                scenario: 'sets metafield when match found in tree',
                hasMetafieldInTree: true,
                keyExists: true,
                shouldSetMetafield: true,
            },
            {
                scenario: 'does not set metafield when no match found',
                hasMetafieldInTree: true,
                keyExists: false,
                shouldSetMetafield: false,
            },
            {
                scenario: 'does not set metafield when no metafield in tree',
                hasMetafieldInTree: false,
                keyExists: true,
                shouldSetMetafield: false,
            },
        ])(
            '$scenario',
            async ({ hasMetafieldInTree, keyExists, shouldSetMetafield }) => {
                const targetKey = 'vip_status'
                const shopifyIntegrations = [
                    createMockShopifyIntegration({ id: 123 }),
                ]

                const definitions = keyExists
                    ? [
                          createMockMetafieldDefinition({
                              id: '1',
                              key: targetKey,
                              name: 'VIP Status',
                          }),
                      ]
                    : [
                          createMockMetafieldDefinition({
                              id: '1',
                              key: 'other_key',
                              name: 'Other',
                          }),
                      ]

                const { handler } = mockListMetafieldDefinitionsHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: definitions,
                        }),
                )
                server.use(handler)

                const syntaxTreeLeaves = hasMetafieldInTree
                    ? createSyntaxTreeLeaves([
                          'ticket',
                          'customer',
                          'integrations',
                          'shopify',
                          'stores',
                          '123',
                          'customer',
                          'metafields',
                          targetKey,
                          'value',
                      ])
                    : createSyntaxTreeLeaves(['ticket', 'customer', 'name'])

                const { result } = renderHook(
                    () =>
                        useMetafieldRuleSelection({
                            syntaxTreeLeaves,
                            actions: mockActions,
                            parent: List([]),
                            shopifyIntegrations,
                        }),
                    { wrapper },
                )

                await waitFor(() => {
                    expect(result.current.isLoadingMetafields).toBe(false)
                })

                await waitFor(() => {
                    if (shouldSetMetafield) {
                        expect(result.current.selectedMetafield?.key).toBe(
                            targetKey,
                        )
                    } else {
                        expect(result.current.selectedMetafield).toBeNull()
                    }
                })
            },
        )

        it('does not override existing selectedMetafield', async () => {
            const shopifyIntegrations = [
                createMockShopifyIntegration({ id: 123 }),
            ]

            const definitions = [
                createMockMetafieldDefinition({
                    id: '1',
                    key: 'vip_status',
                    name: 'VIP Status',
                }),
                createMockMetafieldDefinition({
                    id: '2',
                    key: 'other_field',
                    name: 'Other Field',
                }),
            ]

            const { handler } = mockListMetafieldDefinitionsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: definitions,
                    }),
            )
            server.use(handler)

            const syntaxTreeLeaves = createSyntaxTreeLeaves([
                'ticket',
                'customer',
                'integrations',
                'shopify',
                'stores',
                '123',
                'customer',
                'metafields',
                'vip_status',
                'value',
            ])

            const { result } = renderHook(
                () =>
                    useMetafieldRuleSelection({
                        syntaxTreeLeaves,
                        actions: mockActions,
                        parent: List([]),
                        shopifyIntegrations,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isLoadingMetafields).toBe(false)
            })

            await waitFor(() => {
                expect(result.current.selectedMetafield?.key).toBe('vip_status')
            })

            const manuallySelectedField = createMockField({
                key: 'manual_field',
            })
            act(() => {
                result.current.setSelectedStore(shopifyIntegrations[0])
            })

            act(() => {
                result.current.selectMetafield(
                    manuallySelectedField,
                    'Customer',
                )
            })

            expect(result.current.selectedMetafield?.key).toBe('manual_field')
        })
    })

    describe('resetMetafieldSelection', () => {
        it('resets showMetafieldSelection to null', async () => {
            const shopifyIntegrations = [
                createMockShopifyIntegration({ id: 123 }),
            ]
            const field = createMockField({ key: 'test_field' })

            const { result } = renderHook(
                () =>
                    useMetafieldRuleSelection({
                        syntaxTreeLeaves: null,
                        actions: mockActions,
                        parent: List([]),
                        shopifyIntegrations,
                    }),
                { wrapper },
            )

            act(() => {
                result.current.setSelectedStore(shopifyIntegrations[0])
            })

            act(() => {
                result.current.selectMetafield(field, 'Customer')
            })

            expect(result.current.showMetafieldSelection).toBe('Customer')
            expect(result.current.selectedMetafield).toEqual(field)

            act(() => {
                result.current.resetMetafieldSelection()
            })

            expect(result.current.showMetafieldSelection).toBeNull()
            expect(result.current.selectedMetafield).toBeNull()
        })
    })

    describe('metafieldLevel state', () => {
        it('initializes with "stores" level and allows setting new value', async () => {
            const shopifyIntegrations = [createMockShopifyIntegration()]

            const { result } = renderHook(
                () =>
                    useMetafieldRuleSelection({
                        syntaxTreeLeaves: null,
                        actions: mockActions,
                        parent: List([]),
                        shopifyIntegrations,
                    }),
                { wrapper },
            )

            expect(result.current.metafieldLevel).toBe('stores')

            act(() => {
                result.current.setMetafieldLevel('metafields')
            })

            expect(result.current.metafieldLevel).toBe('metafields')
        })
    })
})
