import { CustomerInfo } from '@repo/customer'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { render } from '@repo/testing'
import {
    NewTicketInfobarTicketCustomerHeader,
    SearchAndPreviewCustomersPanel,
} from '@repo/tickets'
import { screen } from '@testing-library/react'

import type { TicketCustomer } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser, useGetCustomer } from '@gorgias/helpdesk-queries'

import { useCustomerProfileActions } from 'pages/common/components/infobar/Infobar/useCustomerProfileActions'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'

import { NewTicketPageInfobar } from './NewTicketPageInfobar'

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))

jest.mock('@repo/customer', () => ({
    CustomerInfo: jest.fn(() => <div>CustomerInfo</div>),
    ShopifyCustomerProvider: jest.fn(({ children }) => <>{children}</>),
}))

jest.mock('@repo/tickets', () => ({
    InfobarCustomerFields: jest.fn(() => <div>InfobarCustomerFields</div>),
    InfobarTicketCustomerDetailsContainer: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    InfobarTicketDetailsContainer: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    InfobarTicketDetailsHeaderContainer: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    NewTicketInfobarTicketCustomerHeader: jest.fn(() => (
        <div>NewTicketInfobarTicketCustomerHeader</div>
    )),
    SearchAndPreviewCustomersPanel: jest.fn(({ isOpen, onSetCustomer }) =>
        isOpen ? (
            <button
                type="button"
                onClick={() =>
                    onSetCustomer({
                        id: 456,
                        email: 'grace@example.com',
                        name: 'Grace Hopper',
                    })
                }
            >
                Select searched customer
            </button>
        ) : null,
    ),
    TagsMultiSelect: jest.fn(() => <div>TagsMultiSelect</div>),
    TicketInfobarTicketDetailsTagsContainer: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetCurrentUser: jest.fn(),
    useGetCustomer: jest.fn(),
}))

jest.mock(
    'pages/common/components/infobar/Infobar/TicketTimelineWidget/TicketTimelineWidgetContainer',
    () => ({
        TicketTimelineWidgetContainer: jest.fn(() => (
            <div>TicketTimelineWidgetContainer</div>
        )),
    }),
)

jest.mock(
    'pages/common/components/infobar/Infobar/useCustomerProfileActions',
    () => ({
        useCustomerProfileActions: jest.fn(),
    }),
)

jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    makeHasIntegrationOfTypes: jest.fn(),
}))

jest.mock(
    'tickets/pages/NewTicketPage/components/NewTicketPageInfobar/NewTicketPageInfobarFields',
    () => ({
        NewTicketPageInfobarFields: jest.fn(() => (
            <div>NewTicketPageInfobarFields</div>
        )),
    }),
)

jest.mock('tickets/ticket-timeline', () => ({
    TimelineContent: jest.fn(() => <div>TimelineContent</div>),
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/components/OrderSidePanelWithActions',
    () => ({
        OrderSidePanelWithActions: jest.fn(() => (
            <div>OrderSidePanelWithActions</div>
        )),
    }),
)

const mockUseTicketInfobarNavigation = jest.mocked(useTicketInfobarNavigation)
const mockUseCustomerProfileActions = jest.mocked(useCustomerProfileActions)
const mockMakeHasIntegrationOfTypes = jest.mocked(makeHasIntegrationOfTypes)
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser)
const mockUseGetCustomer = jest.mocked(useGetCustomer)
const mockCustomerInfo = jest.mocked(CustomerInfo)
const mockNewTicketInfobarTicketCustomerHeader = jest.mocked(
    NewTicketInfobarTicketCustomerHeader,
)
const mockSearchAndPreviewCustomersPanel = jest.mocked(
    SearchAndPreviewCustomersPanel,
)

const customer = {
    id: 123,
    email: 'ada@example.com',
    name: 'Ada Lovelace',
} as TicketCustomer

describe('NewTicketPageInfobar', () => {
    const handleEditCustomer = jest.fn()
    const handleSyncToShopify = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
        } as any)
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                name: 'Ada Lovelace',
                firstname: 'Ada',
                lastname: 'Lovelace',
                email: 'ada@example.com',
            },
        } as any)
        mockUseGetCustomer.mockReturnValue({ data: undefined } as any)
        mockUseCustomerProfileActions.mockReturnValue({
            handleEditCustomer,
            handleSyncToShopify,
            customerProfileActionModals: <div>CustomerProfileActionModals</div>,
        })
        mockMakeHasIntegrationOfTypes.mockReturnValue(() => true)
    })

    it('passes customer action callbacks and Shopify integration state to the customer header', () => {
        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={customer}
            />,
        )

        expect(mockNewTicketInfobarTicketCustomerHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                customer,
                onEditCustomer: handleEditCustomer,
                onSyncToShopify: handleSyncToShopify,
                hasShopifyIntegration: true,
            }),
            {},
        )
    })

    it('renders the Shopify customer panel when the Shopify tab is active', () => {
        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: TicketInfobarTab.Shopify,
        } as any)
        const shopifyCustomer = {
            ...customer,
            integrations: {
                '42': {
                    __integration_type__: 'shopify',
                    customer: {
                        id: 456,
                    },
                },
            },
        } as TicketCustomer

        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={shopifyCustomer}
            />,
        )

        expect(screen.getByText('CustomerInfo')).toBeInTheDocument()
        expect(mockCustomerInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                associatedShopifyCustomerIds: new Set([42]),
                externalIdMap: new Map([[42, '456']]),
                customerId: customer.id,
                onSyncProfile: expect.any(Function),
                currentUser: {
                    name: 'Ada Lovelace',
                    firstname: 'Ada',
                    lastname: 'Lovelace',
                    email: 'ada@example.com',
                },
            }),
            {},
        )
        mockCustomerInfo.mock.calls[0][0].onSyncProfile?.()
        expect(handleSyncToShopify).toHaveBeenCalledWith(shopifyCustomer)
    })

    it('uses the full customer response to resolve Shopify profile data', () => {
        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: TicketInfobarTab.Shopify,
        } as any)
        mockUseGetCustomer.mockReturnValue({
            data: {
                data: {
                    ...customer,
                    integrations: {
                        '42': {
                            __integration_type__: 'shopify',
                            customer: {
                                id: 456,
                            },
                        },
                    },
                },
            },
        } as any)

        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={customer}
            />,
        )

        expect(mockUseGetCustomer).toHaveBeenCalledWith(123, undefined, {
            query: {
                enabled: true,
            },
        })
        expect(mockCustomerInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                associatedShopifyCustomerIds: new Set([42]),
                externalIdMap: new Map([[42, '456']]),
            }),
            {},
        )
    })

    it('opens the customer search panel from the empty customer state', async () => {
        const { user } = render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={null}
            />,
        )

        expect(mockSearchAndPreviewCustomersPanel).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: false,
            }),
            {},
        )

        await user.click(
            screen.getByRole('button', { name: 'Search customers' }),
        )

        expect(mockSearchAndPreviewCustomersPanel).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: true,
                onSetCustomer: expect.any(Function),
                setCustomerLabel: 'Select customer',
            }),
            {},
        )
    })

    it('sets the selected customer from the search panel as the new ticket customer', async () => {
        const handleCustomerChange = jest.fn()
        const { user } = render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={handleCustomerChange}
                customer={null}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'Search customers' }),
        )
        await user.click(
            screen.getByRole('button', { name: 'Select searched customer' }),
        )

        expect(handleCustomerChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 456,
                email: 'grace@example.com',
                name: 'Grace Hopper',
            }),
        )
    })
})
