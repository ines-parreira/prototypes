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
import { TimelineSidePanel } from 'pages/tickets/detail/TimelineSidePanel'
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

jest.mock('@repo/tickets/infobar-sections', () => ({
    ...jest.requireActual('@repo/tickets/infobar-sections'),
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

jest.mock('pages/tickets/detail/TimelineSidePanel', () => ({
    TimelineSidePanel: jest.fn(() => <div>TimelineSidePanel</div>),
}))

jest.mock(
    'pages/tickets/detail/TicketCustomerSections/useTicketInfobarSectionFlags',
    () => ({
        useTicketInfobarSectionFlags: jest.fn(() => ({
            hasShopify: false,
            hasRecharge: false,
            hasBigCommerce: false,
            hasMagento: false,
            hasWooCommerce: false,
            hasSmile: false,
            hasYotpo: false,
            hasCustomIntegrations: false,
        })),
    }),
)

jest.mock(
    'pages/tickets/detail/TicketCustomerSections/useCustomerFilteredIntegrations',
    () => ({
        useCustomerFilteredIntegrations: jest.fn(() => new Map()),
    }),
)

jest.mock('pages/tickets/detail/IntegrationTabContent', () => ({
    __esModule: true,
    default: jest.fn(() => <div>IntegrationTabContent</div>),
}))

jest.mock('pages/tickets/detail/WooCommerceTabContent', () => ({
    __esModule: true,
    default: jest.fn(() => <div>WooCommerceTabContent</div>),
}))

jest.mock('pages/tickets/detail/CustomIntegrationsTabContent', () => ({
    __esModule: true,
    default: jest.fn(() => <div>CustomIntegrationsTabContent</div>),
}))

jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    makeHasIntegrationOfTypes: jest.fn(),
}))

jest.mock('state/widgets/selectors', () => ({
    ...jest.requireActual('state/widgets/selectors'),
    getSourcesWithCustomer: jest.fn(() => undefined),
    getWidgetsState: jest.fn(() => undefined),
}))

jest.mock('state/widgets/actions', () => ({
    ...jest.requireActual('state/widgets/actions'),
    selectContext: jest.fn(() => () => undefined),
    fetchWidgets: jest.fn(() => () => Promise.resolve()),
}))

jest.mock(
    'tickets/pages/NewTicketPage/components/NewTicketPageInfobar/NewTicketPageInfobarFields',
    () => ({
        NewTicketPageInfobarFields: jest.fn(() => (
            <div>NewTicketPageInfobarFields</div>
        )),
    }),
)

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
const mockTimelineSidePanel = jest.mocked(TimelineSidePanel)
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
    const onChangeTab = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            onChangeTab,
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

    it('renders both customer and shopify sections when a customer is set and shopify is integrated', () => {
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

        expect(
            screen.getByText('NewTicketInfobarTicketCustomerHeader'),
        ).toBeInTheDocument()
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

    it('omits the shopify section when shopify is not integrated', () => {
        mockMakeHasIntegrationOfTypes.mockReturnValue(() => false)

        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={customer}
            />,
        )

        expect(screen.queryByText('CustomerInfo')).not.toBeInTheDocument()
    })

    it('uses the full customer response to resolve Shopify profile data', () => {
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

    it('mounts the timeline side panel closed when a customer is set', () => {
        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={customer}
            />,
        )

        expect(mockTimelineSidePanel).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: false,
                shopperId: customer.id,
            }),
            {},
        )
    })

    it('opens the timeline side panel when the active tab is Timeline', () => {
        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: TicketInfobarTab.Timeline,
            onChangeTab,
        } as any)

        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={customer}
            />,
        )

        expect(mockTimelineSidePanel).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: true,
                shopperId: customer.id,
            }),
            {},
        )
    })

    it('does not mount the timeline side panel when no customer is selected', () => {
        render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={null}
            />,
        )

        expect(mockTimelineSidePanel).not.toHaveBeenCalled()
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

    it('closes the customer search panel after a customer is selected', async () => {
        const { user } = render(
            <NewTicketPageInfobar
                tags={[]}
                onTagsChange={jest.fn()}
                onCustomerChange={jest.fn()}
                customer={null}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'Search customers' }),
        )

        expect(mockSearchAndPreviewCustomersPanel).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: true }),
            {},
        )

        await user.click(
            screen.getByRole('button', { name: 'Select searched customer' }),
        )

        expect(mockSearchAndPreviewCustomersPanel).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            {},
        )
    })
})
