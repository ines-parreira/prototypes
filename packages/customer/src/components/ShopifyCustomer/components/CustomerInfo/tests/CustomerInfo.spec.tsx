import { DateFormatType, TimeFormatType } from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockEcommerceData,
    mockGetEcommerceDataByExternalIdHandler,
    mockListEcommerceDataHandler,
    mockPaginatedDataEcommerceData,
} from '@gorgias/ecommerce-storage-mocks'
import {
    mockListIntegrationsHandler,
    mockListWidgetsHandler,
} from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { CustomerInfo } from '../'
import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { useGetDraftOrders } from '../../../hooks/useGetDraftOrders'
import { useGetOrders } from '../../../hooks/useGetOrders'
import { ShopifyCustomerContext } from '../../../ShopifyCustomerContext'
import type { OrderEcommerceData } from '../../../types'

vi.mock('../../../hooks/useGetOrders', () => ({
    useGetOrders: vi.fn(),
}))

vi.mock('../../../hooks/useGetDraftOrders', () => ({
    useGetDraftOrders: vi.fn(),
}))

const mockUseTicketInfobarNavigation = vi.fn().mockReturnValue({
    shopifyIntegrationId: undefined,
    activeTab: undefined,
    isExpanded: true,
    isEditShopifyFieldsOpen: false,
    onChangeTab: vi.fn(),
    onToggle: vi.fn(),
    onToggleEditShopifyFields: vi.fn(),
})

vi.mock('@repo/navigation', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useTicketInfobarNavigation: (...args: unknown[]) =>
        mockUseTicketInfobarNavigation(...args),
}))

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: DateFormatType.en_US,
        timeFormat: TimeFormatType.AmPm,
        timezone: undefined,
    }),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const mockShopifyIntegration = {
    id: 1,
    name: 'Test Shopify Store',
    type: 'shopify',
    created_datetime: '2024-01-01T00:00:00Z',
    meta: { shop_name: 'test-store' },
} as Integration

const associatedShopifyCustomerIds = new Set([1])
const externalIdMap = new Map([[1, '456']])

const mockListIntegrations = mockListIntegrationsHandler(async () =>
    HttpResponse.json({
        data: [mockShopifyIntegration],
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/integrations',
    }),
)

const mockShopperData = {
    id: 12345,
    first_name: 'John',
    last_name: 'Doe',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    state: 'enabled',
    note: '',
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    email: 'john.doe@example.com',
    phone: null,
    currency: 'USD',
    addresses: [],
    tax_exemptions: [],
    admin_graphql_api_id: 'gid://shopify/Customer/12345',
    default_address: null,
    tags: '',
    metafields: [],
}

const mockGetEcommerceData = mockGetEcommerceDataByExternalIdHandler(async () =>
    HttpResponse.json(
        mockEcommerceData({
            data: mockShopperData,
            relationships: {
                shopper_identity_id: 'shopper-identity-1',
            },
        }),
    ),
)

const mockOrderData = mockEcommerceData({
    external_id: 'order-1',
    data: {
        id: 99001,
        order_number: 3001,
        name: '#3001',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        currency: 'USD',
        total_price: '50.00',
        financial_status: 'paid',
        fulfillment_status: null,
        line_items: [],
        customer: mockShopperData,
    },
})

const mockListOrders = mockListEcommerceDataHandler(async () =>
    HttpResponse.json(
        mockPaginatedDataEcommerceData({
            data: [mockOrderData],
        }),
    ),
)

const shopTagsHandler = http.get(
    '/integrations/shopify/shop-tags/customers/list/',
    () =>
        HttpResponse.json({
            data: {
                shop: {
                    customerTags: {
                        edges: [],
                    },
                },
            },
        }),
)

const shopOrderTagsHandler = http.get(
    '/integrations/shopify/shop-tags/orders/list/',
    () =>
        HttpResponse.json({
            data: {
                shop: {
                    orderTags: {
                        edges: [],
                    },
                },
            },
        }),
)

const metafieldDefinitionsHandler = http.get(
    '/api/integrations/shopify/:integrationId/metafield-definitions',
    () => HttpResponse.json({ data: [], meta: {} }),
)

const mockListWidgets = mockListWidgetsHandler()

beforeEach(() => {
    mockUseTicketInfobarNavigation.mockReturnValue({
        shopifyIntegrationId: undefined,
        activeTab: undefined,
        isExpanded: true,
        isEditShopifyFieldsOpen: false,
        onChangeTab: vi.fn(),
        onToggle: vi.fn(),
        onToggleEditShopifyFields: vi.fn(),
    })

    vi.mocked(useGetOrders).mockReturnValue({
        orders: undefined,
        isLoadingOrders: false,
        refetchOrders: vi.fn(),
    })

    vi.mocked(useGetDraftOrders).mockReturnValue({
        orders: undefined,
        isLoadingOrders: false,
    })

    server.use(
        mockListIntegrations.handler,
        mockGetEcommerceData.handler,
        mockListOrders.handler,
        shopTagsHandler,
        shopOrderTagsHandler,
        metafieldDefinitionsHandler,
        mockListWidgets.handler,
    )
})

describe('CustomerInfo', () => {
    it('renders the store picker with the selected integration', async () => {
        render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })
    })

    it('calls onStoreChange when an integration is loaded', async () => {
        const onStoreChange = vi.fn()
        render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                onStoreChange={onStoreChange}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(onStoreChange).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
            )
        })
    })

    it('calls onStoreChange when user selects a different store', async () => {
        const secondIntegration = {
            id: 2,
            name: 'Second Shopify Store',
            type: 'shopify',
            created_datetime: '2024-01-02T00:00:00Z',
            meta: {},
        } as Integration

        const multipleassociatedShopifyCustomerIds = new Set([1, 2])
        const multipleExternalIdMap = new Map([
            [1, '456'],
            [2, '789'],
        ])

        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json({
                data: [mockShopifyIntegration, secondIntegration],
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
                uri: '/api/integrations',
            }),
        )

        server.use(mockListIntegrations.handler)

        const onStoreChange = vi.fn()
        const { user } = render(
            <CustomerInfo
                associatedShopifyCustomerIds={
                    multipleassociatedShopifyCustomerIds
                }
                externalIdMap={multipleExternalIdMap}
                onStoreChange={onStoreChange}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(onStoreChange).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
            )
        })

        onStoreChange.mockClear()

        await act(() =>
            user.click(
                screen.getByRole('button', { name: /test shopify store/i }),
            ),
        )

        await act(() =>
            user.click(
                screen.getByRole('option', { name: /second shopify store/i }),
            ),
        )

        expect(onStoreChange).toHaveBeenCalledWith(secondIntegration.id)
    })

    it('only shows integrations that are in the ticket', async () => {
        const secondIntegration = {
            id: 2,
            name: 'Second Shopify Store',
            type: 'shopify',
            created_datetime: '2024-01-02T00:00:00Z',
            meta: {},
        } as Integration

        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json({
                data: [mockShopifyIntegration, secondIntegration],
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
                uri: '/api/integrations',
            }),
        )

        server.use(mockListIntegrations.handler)

        const { user } = render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })

        await act(() =>
            user.click(
                screen.getByRole('button', { name: /test shopify store/i }),
            ),
        )

        expect(
            screen.queryByRole('option', { name: /second shopify store/i }),
        ).not.toBeInTheDocument()
    })

    it('renders the customer link with correct Shopify URL', async () => {
        render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            const link = screen.getByRole('link', { name: /john doe/i })
            expect(link).toHaveAttribute(
                'href',
                'https://admin.shopify.com/store/test-store/customers/12345',
            )
        })
    })

    it('renders empty state when no integrations match', async () => {
        const onSyncProfile = vi.fn()
        render(
            <CustomerInfo
                associatedShopifyCustomerIds={new Set()}
                externalIdMap={new Map()}
                onSyncProfile={onSyncProfile}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /no matching profile found\. do you want to sync this customer to shopify\?/i,
                ),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByRole('button', { name: /sync profile/i }),
        ).toBeInTheDocument()
    })

    it('calls onSyncProfile when clicking sync profile button in empty state', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <CustomerInfo
                associatedShopifyCustomerIds={new Set()}
                externalIdMap={new Map()}
                onSyncProfile={onSyncProfile}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync profile/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /sync profile/i }))

        expect(onSyncProfile).toHaveBeenCalledTimes(1)
    })

    it('renders sync action in store picker when onSyncProfile is provided', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                onSyncProfile={onSyncProfile}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })

        await user.click(
            screen.getByRole('button', { name: /test shopify store/i }),
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync to other stores/i }),
            ).toBeInTheDocument()
        })
    })

    it('selects the integration matching shopifyIntegrationId from navigation context', async () => {
        mockUseTicketInfobarNavigation.mockReturnValue({
            shopifyIntegrationId: 2,
            activeTab: undefined,
            isExpanded: true,
            onChangeTab: vi.fn(),
            onToggle: vi.fn(),
        })

        const secondIntegration = {
            id: 2,
            name: 'Second Shopify Store',
            type: 'shopify',
            created_datetime: '2024-01-02T00:00:00Z',
            meta: { shop_name: 'second-store' },
        } as Integration

        const multipleAssociatedShopifyCustomerIds = new Set([1, 2])
        const multipleExternalIdMap = new Map([
            [1, '456'],
            [2, '789'],
        ])

        const mockListMultipleIntegrations = mockListIntegrationsHandler(
            async () =>
                HttpResponse.json({
                    data: [mockShopifyIntegration, secondIntegration],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                    },
                    object: 'list',
                    uri: '/api/integrations',
                }),
        )

        const mockGetSecondEcommerceData =
            mockGetEcommerceDataByExternalIdHandler(async () =>
                HttpResponse.json(
                    mockEcommerceData({
                        data: mockShopperData,
                    }),
                ),
            )

        server.use(
            mockListMultipleIntegrations.handler,
            mockGetSecondEcommerceData.handler,
        )

        render(
            <CustomerInfo
                associatedShopifyCustomerIds={
                    multipleAssociatedShopifyCustomerIds
                }
                externalIdMap={multipleExternalIdMap}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                'Second Shopify Store',
            )
        })
    })

    it('calls onSyncProfile when clicking sync action in store picker', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                onSyncProfile={onSyncProfile}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })

        await user.click(
            screen.getByRole('button', { name: /test shopify store/i }),
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync to other stores/i }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: /sync to other stores/i }),
        )

        expect(onSyncProfile).toHaveBeenCalledTimes(1)
    })

    it('renders IntermediateEditPanel when isEditShopifyFieldsOpen is true', async () => {
        mockUseTicketInfobarNavigation.mockReturnValue({
            shopifyIntegrationId: undefined,
            activeTab: undefined,
            isExpanded: true,
            isEditShopifyFieldsOpen: true,
            onChangeTab: vi.fn(),
            onToggle: vi.fn(),
            onToggleEditShopifyFields: vi.fn(),
        })

        render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Customer metrics')).toBeInTheDocument()
        })

        expect(
            screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument()

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    describe('Order selection', () => {
        const mockOrder: OrderEcommerceData = {
            id: 'order-1',
            account_id: 1,
            created_datetime: '2024-01-15T10:00:00Z',
            updated_datetime: '2024-01-15T10:00:00Z',
            source_type: 'shopify',
            integration_id: 1,
            external_id: 'ext-order-1',
            data: {
                id: 12345,
                name: '#1001',
                financial_status: 'paid',
                fulfillment_status: 'fulfilled',
                line_items: [],
                currency: 'USD',
                total_price: '99.99',
            } as unknown as OrderEcommerceData['data'],
        }

        it('should open the order side panel when an order card is clicked', async () => {
            vi.mocked(useGetOrders).mockReturnValue({
                orders: [mockOrder],
                isLoadingOrders: false,
                refetchOrders: vi.fn(),
            })

            const { user } = render(
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('#1001')).toBeInTheDocument()
            })

            await user.click(screen.getByText('#1001'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /order #1001/i }),
                ).toBeInTheDocument()
            })
        })

        it('renders customer metafields above the orders list', async () => {
            vi.mocked(useGetOrders).mockReturnValue({
                orders: [mockOrder],
                isLoadingOrders: false,
                refetchOrders: vi.fn(),
            })

            server.use(
                http.get(
                    '/api/integrations/shopify/:integrationId/metafield-definitions',
                    () =>
                        HttpResponse.json({
                            data: [
                                {
                                    namespace: 'custom',
                                    key: 'vip_tier',
                                    name: 'VIP Tier',
                                },
                            ],
                            meta: {},
                        }),
                ),
                mockGetEcommerceDataByExternalIdHandler(async () =>
                    HttpResponse.json(
                        mockEcommerceData({
                            data: {
                                ...mockShopperData,
                                metafields: [
                                    {
                                        namespace: 'custom',
                                        key: 'vip_tier',
                                        type: 'single_line_text_field',
                                        value: 'Gold',
                                    },
                                ],
                            },
                            relationships: {
                                shopper_identity_id: 'shopper-identity-1',
                            },
                        }),
                    ),
                ).handler,
            )

            render(
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />,
            )

            let metafieldLabel: HTMLElement | undefined
            let orderName: HTMLElement | undefined

            await waitFor(() => {
                metafieldLabel = screen.getByText('VIP Tier')
                expect(screen.getByText('Gold')).toBeInTheDocument()
                orderName = screen.getByText('#1001')
            })

            expect(metafieldLabel).toBeDefined()
            expect(orderName).toBeDefined()
            expect(
                metafieldLabel!.compareDocumentPosition(orderName!) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy()
        })
    })

    describe('Order actions', () => {
        const mockOrder: OrderEcommerceData = {
            id: 'order-1',
            account_id: 1,
            created_datetime: '2024-01-15T10:00:00Z',
            updated_datetime: '2024-01-15T10:00:00Z',
            source_type: 'shopify',
            integration_id: 1,
            external_id: 'ext-order-1',
            data: {
                id: 12345,
                name: '#1001',
                financial_status: 'paid',
                fulfillment_status: 'fulfilled',
                line_items: [],
                currency: 'USD',
                total_price: '99.99',
            } as unknown as OrderEcommerceData['data'],
        }

        beforeEach(() => {
            vi.mocked(useGetOrders).mockReturnValue({
                orders: [mockOrder],
                isLoadingOrders: false,
                refetchOrders: vi.fn(),
            })
        })

        async function openOrderSidePanel(
            user: ReturnType<typeof render>['user'],
        ) {
            await waitFor(() => {
                expect(screen.getByText('#1001')).toBeInTheDocument()
            })
            await user.click(screen.getByText('#1001'))
            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /order #1001/i }),
                ).toBeInTheDocument()
            })
        }

        it('calls onDuplicateOrder with integration id and order data when Duplicate is clicked', async () => {
            const onDuplicateOrder = vi.fn()
            const { user } = render(
                <ShopifyCustomerContext.Provider
                    value={{ dispatchNotification: vi.fn(), onDuplicateOrder }}
                >
                    <CustomerInfo
                        associatedShopifyCustomerIds={
                            associatedShopifyCustomerIds
                        }
                        externalIdMap={externalIdMap}
                        ticketId="123"
                    />
                </ShopifyCustomerContext.Provider>,
            )

            await openOrderSidePanel(user)
            await user.click(screen.getByRole('button', { name: /duplicate/i }))

            expect(onDuplicateOrder).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
                mockOrder.data,
            )
        })

        it('calls onRefundOrder with integration id and order data when Refund is clicked', async () => {
            const onRefundOrder = vi.fn()
            const { user } = render(
                <ShopifyCustomerContext.Provider
                    value={{ dispatchNotification: vi.fn(), onRefundOrder }}
                >
                    <CustomerInfo
                        associatedShopifyCustomerIds={
                            associatedShopifyCustomerIds
                        }
                        externalIdMap={externalIdMap}
                        ticketId="123"
                    />
                </ShopifyCustomerContext.Provider>,
            )

            await openOrderSidePanel(user)
            await user.click(screen.getByRole('button', { name: /refund/i }))

            expect(onRefundOrder).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
                mockOrder.data,
            )
        })

        it('calls onCancelOrder with integration id and order data when Cancel is clicked', async () => {
            const onCancelOrder = vi.fn()
            const { user } = render(
                <ShopifyCustomerContext.Provider
                    value={{ dispatchNotification: vi.fn(), onCancelOrder }}
                >
                    <CustomerInfo
                        associatedShopifyCustomerIds={
                            associatedShopifyCustomerIds
                        }
                        externalIdMap={externalIdMap}
                        ticketId="123"
                    />
                </ShopifyCustomerContext.Provider>,
            )

            await openOrderSidePanel(user)
            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(onCancelOrder).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
                mockOrder.data,
            )
        })
    })

    it('calls onToggleEditShopifyFields(false) when Confirm is clicked in IntermediateEditPanel', async () => {
        const onToggleEditShopifyFields = vi.fn()
        mockUseTicketInfobarNavigation.mockReturnValue({
            shopifyIntegrationId: undefined,
            activeTab: undefined,
            isExpanded: true,
            isEditShopifyFieldsOpen: true,
            onChangeTab: vi.fn(),
            onToggle: vi.fn(),
            onToggleEditShopifyFields,
        })

        const { user } = render(
            <CustomerInfo
                associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                externalIdMap={externalIdMap}
                ticketId="123"
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm/i }))

        expect(onToggleEditShopifyFields).toHaveBeenCalledWith(false)
    })

    describe('Address sections', () => {
        const mockAddress1 = {
            id: 1001,
            address1: '123 Main St',
            city: 'New York',
            first_name: 'John',
            last_name: 'Doe',
        }

        const mockAddress2 = {
            id: 1002,
            address1: '456 Oak Ave',
            city: 'Los Angeles',
            first_name: 'Jane',
            last_name: 'Doe',
        }

        function createWidgetListResponse(
            sectionPreferences: Record<
                string,
                { fields: Array<{ id: string; visible: boolean }> }
            >,
        ) {
            return {
                data: [
                    {
                        id: 1,
                        type: 'shopify' as const,
                        context: 'ticket' as const,
                        template: {
                            type: 'wrapper',
                            widgets: [
                                {
                                    path: 'customer',
                                    type: 'customer',
                                    widgets: [
                                        {
                                            path: 'email',
                                            type: 'email',
                                            title: 'Email',
                                        },
                                    ],
                                    meta: {
                                        custom: {
                                            fieldPreferences: [
                                                {
                                                    id: 'email',
                                                    visible: true,
                                                },
                                            ],
                                            sectionPreferences,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }
        }

        it('renders a CollapsibleFieldSection per address', async () => {
            const widgetResponse = createWidgetListResponse({
                addresses: {
                    fields: [
                        { id: 'address1', visible: true },
                        { id: 'city', visible: true },
                    ],
                },
            })

            server.use(
                mockListWidgetsHandler(async () =>
                    HttpResponse.json(widgetResponse),
                ).handler,
                mockGetEcommerceDataByExternalIdHandler(async () =>
                    HttpResponse.json(
                        mockEcommerceData({
                            data: {
                                ...mockShopperData,
                                addresses: [mockAddress1, mockAddress2],
                            },
                            relationships: {
                                shopper_identity_id: 'shopper-identity-1',
                            },
                        }),
                    ),
                ).handler,
            )

            render(
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getAllByRole('button', {
                        name: /collapse address/i,
                    }),
                ).toHaveLength(2)
            })

            expect(screen.getByText('123 Main St')).toBeInTheDocument()
            expect(screen.getByText('New York')).toBeInTheDocument()
            expect(screen.getByText('456 Oak Ave')).toBeInTheDocument()
            expect(screen.getByText('Los Angeles')).toBeInTheDocument()
        })

        it('renders no address sections when addresses array is empty', async () => {
            const widgetResponse = createWidgetListResponse({
                addresses: {
                    fields: [
                        { id: 'address1', visible: true },
                        { id: 'city', visible: true },
                    ],
                },
            })

            server.use(
                mockListWidgetsHandler(async () =>
                    HttpResponse.json(widgetResponse),
                ).handler,
            )

            render(
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('link', { name: /john doe/i }),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', {
                    name: /collapse address/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('collapse and expand works on address section', async () => {
            const widgetResponse = createWidgetListResponse({
                addresses: {
                    fields: [{ id: 'address1', visible: true }],
                },
            })

            server.use(
                mockListWidgetsHandler(async () =>
                    HttpResponse.json(widgetResponse),
                ).handler,
                mockGetEcommerceDataByExternalIdHandler(async () =>
                    HttpResponse.json(
                        mockEcommerceData({
                            data: {
                                ...mockShopperData,
                                addresses: [mockAddress1],
                            },
                            relationships: {
                                shopper_identity_id: 'shopper-identity-1',
                            },
                        }),
                    ),
                ).handler,
            )

            const { user } = render(
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('123 Main St')).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', {
                    name: /collapse address/i,
                }),
            )

            expect(screen.queryByText('123 Main St')).not.toBeInTheDocument()

            await user.click(
                screen.getByRole('button', {
                    name: /expand address/i,
                }),
            )

            expect(screen.getByText('123 Main St')).toBeInTheDocument()
        })

        it('renders non-address section with its label', async () => {
            const widgetResponse = createWidgetListResponse({
                defaultAddress: {
                    fields: [{ id: 'address1', visible: true }],
                },
            })

            server.use(
                mockListWidgetsHandler(async () =>
                    HttpResponse.json(widgetResponse),
                ).handler,
                mockGetEcommerceDataByExternalIdHandler(async () =>
                    HttpResponse.json(
                        mockEcommerceData({
                            data: {
                                ...mockShopperData,
                                default_address: {
                                    id: 2001,
                                    address1: '789 Pine Rd',
                                    city: 'Chicago',
                                },
                            },
                            relationships: {
                                shopper_identity_id: 'shopper-identity-1',
                            },
                        }),
                    ),
                ).handler,
            )

            render(
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /collapse default address/i,
                    }),
                ).toBeInTheDocument()
            })

            expect(screen.getByText('789 Pine Rd')).toBeInTheDocument()
        })
    })

    it('calls onCreateOrder with integration id and shopper data when Create order is clicked', async () => {
        const onCreateOrder = vi.fn()

        mockUseTicketInfobarNavigation.mockReturnValue({
            shopifyIntegrationId: undefined,
            activeTab: undefined,
            isExpanded: true,
            isEditShopifyFieldsOpen: false,
            onChangeTab: vi.fn(),
            onToggle: vi.fn(),
            onToggleEditShopifyFields: vi.fn(),
        })

        const { user } = render(
            <ShopifyCustomerContext.Provider
                value={{
                    dispatchNotification: vi.fn(),
                    onCreateOrder,
                }}
            >
                <CustomerInfo
                    associatedShopifyCustomerIds={associatedShopifyCustomerIds}
                    externalIdMap={externalIdMap}
                    ticketId="123"
                />
            </ShopifyCustomerContext.Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: /john doe/i }),
            ).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /create order/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /create order/i }))

        expect(onCreateOrder).toHaveBeenCalledWith(
            mockShopifyIntegration.id,
            expect.objectContaining(mockShopperData),
        )
    })
})
