import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockEcommerceData,
    mockGetEcommerceDataByExternalIdHandler,
} from '@gorgias/ecommerce-storage-mocks'
import {
    mockGetCurrentUserHandler,
    mockListIntegrationsHandler,
} from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { CustomerInfo } from '../'
import { render, testAppQueryClient } from '../../../../../tests/render.utils'

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
}

const mockGetEcommerceData = mockGetEcommerceDataByExternalIdHandler(async () =>
    HttpResponse.json(
        mockEcommerceData({
            data: mockShopperData,
        }),
    ),
)

const mockGetCurrentUser = mockGetCurrentUserHandler()

beforeEach(() => {
    server.use(
        mockListIntegrations.handler,
        mockGetEcommerceData.handler,
        mockGetCurrentUser.handler,
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
})
