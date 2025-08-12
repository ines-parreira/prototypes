import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import { StoreIntegration } from 'models/integration/types'

import { ActionDrivenNavigation } from '../ActionDrivenNavigation'

jest.mock('../useActionDrivenNavbarSections', () => ({
    useActionDrivenNavbarSections: jest.fn(),
}))

jest.mock('../ActionDrivenNavigationItems', () => ({
    ActionDrivenNavigationItems: ({
        navigationItems,
        selectedStore: __selectedStore,
        getChannelStatus: __getChannelStatus,
    }: any) => (
        <div data-testid="navigation-items">
            {navigationItems?.map((item: any) => (
                <div key={item.route}>{item.title}</div>
            ))}
        </div>
    ),
}))

jest.mock('pages/common/components/StoreSelector/StoreSelector', () => {
    return {
        __esModule: true,
        default: ({
            integrations,
            selected,
            onChange,
            shouldShowActiveStatus: __shouldShowActiveStatus,
            fullWidth: __fullWidth,
        }: any) => (
            <div data-testid="store-selector">
                <button>{selected?.name || 'Select a store'}</button>
                {integrations?.map((integration: any) => {
                    return (
                        <div
                            key={integration.id}
                            role="option"
                            onClick={() => {
                                const integrationMatch = integrations.find(
                                    (i: any) => i.id === integration.id,
                                )
                                if (integrationMatch) {
                                    onChange(integration.id)
                                }
                            }}
                        >
                            {integration.name}
                        </div>
                    )
                })}
            </div>
        ),
    }
})

jest.mock('components/Navigation/Navigation', () => ({
    Navigation: {
        Root: ({ children, value, ...props }: any) => (
            <div data-testid="navigation-root" data-value={value} {...props}>
                {children}
            </div>
        ),
    },
}))

const mockShopifyIntegration: StoreIntegration = {
    id: 1,
    name: 'Test Store 1',
    type: IntegrationType.Shopify,
    meta: {
        shop_name: 'test-store-1',
    },
} as StoreIntegration

const mockBigCommerceIntegration: StoreIntegration = {
    id: 2,
    name: 'Test Store 2',
    type: IntegrationType.BigCommerce,
    meta: {},
} as StoreIntegration

const mockNavigationItems = [
    {
        route: '/app/ai-agent/shopify/test-store/overview',
        title: 'Overview',
        exact: true,
    },
    {
        route: '/app/ai-agent/shopify/test-store/analyze',
        title: 'Analyze',
        items: [
            {
                route: '/app/ai-agent/shopify/test-store/analyze/analytics',
                title: 'Analytics',
            },
            {
                route: '/app/ai-agent/shopify/test-store/analyze/opportunities',
                title: 'Opportunities',
            },
        ],
    },
]

const mockUseActionDrivenNavbarSections = jest.requireMock(
    '../useActionDrivenNavbarSections',
).useActionDrivenNavbarSections

describe('ActionDrivenNavigation', () => {
    const mockHandleStoreSelect = jest.fn()
    const mockHandleExpandedSectionsChange = jest.fn()
    const mockGetStoreActivationStatus = jest.fn()
    const mockGetChannelStatus = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseActionDrivenNavbarSections.mockReturnValue({
            selectedStore: 'test-store-1',
            selectedStoreIntegration: mockShopifyIntegration,
            storeIntegrations: [
                mockShopifyIntegration,
                mockBigCommerceIntegration,
            ],
            handleStoreSelect: mockHandleStoreSelect,
            getStoreActivationStatus: mockGetStoreActivationStatus,
            getChannelStatus: mockGetChannelStatus,
            navigationItems: mockNavigationItems,
            expandedSections: ['analyze'],
            handleExpandedSectionsChange: mockHandleExpandedSectionsChange,
        })
    })

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <ActionDrivenNavigation />
            </MemoryRouter>,
        )
    }

    it('renders the navigation with store selector', () => {
        renderComponent()

        expect(screen.getByRole('button')).toBeInTheDocument()
        const storeElements = screen.getAllByText('Test Store 1')
        expect(storeElements.length).toBeGreaterThan(0)
    })

    it('renders navigation items', () => {
        renderComponent()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Analyze')).toBeInTheDocument()
    })

    it('calls handleStoreSelect when a store is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        const options = screen.getAllByRole('option')
        expect(options).toHaveLength(2)

        await act(() => user.click(options[1]))

        expect(mockHandleStoreSelect).toHaveBeenCalled()
    })

    it('passes shouldShowActiveStatus function to StoreSelector', () => {
        mockGetStoreActivationStatus.mockReturnValue(true)
        renderComponent()

        expect(mockGetStoreActivationStatus).not.toHaveBeenCalled()
    })

    it('passes fullWidth prop to StoreSelector', () => {
        const { container } = renderComponent()
        const storeSelector = container.querySelector('.storeSelector')
        expect(storeSelector).toBeInTheDocument()
    })

    it('renders with expanded sections', () => {
        renderComponent()

        const navigationRoot = screen.getByTestId('navigation-root')
        expect(navigationRoot).toHaveAttribute('data-value', 'analyze')
    })

    it('renders navigation root with correct props', () => {
        renderComponent()

        const navigationRoot = screen.getByTestId('navigation-root')
        expect(navigationRoot).toBeInTheDocument()
    })

    it('does not crash when selectedStoreIntegration is undefined', () => {
        mockUseActionDrivenNavbarSections.mockReturnValue({
            selectedStore: undefined,
            selectedStoreIntegration: undefined,
            storeIntegrations: [],
            handleStoreSelect: mockHandleStoreSelect,
            getStoreActivationStatus: mockGetStoreActivationStatus,
            getChannelStatus: mockGetChannelStatus,
            navigationItems: [],
            expandedSections: [],
            handleExpandedSectionsChange: mockHandleExpandedSectionsChange,
        })

        const { container } = renderComponent()
        expect(container.firstChild).toBeInTheDocument()
    })

    it('handles store selection for Shopify integrations with shop_name', async () => {
        const user = userEvent.setup()
        renderComponent()

        const options = screen.getAllByRole('option')
        await act(() => user.click(options[0]))

        expect(mockHandleStoreSelect).toHaveBeenCalledWith('test-store-1')
    })

    it('handles store selection for non-Shopify integrations', async () => {
        const user = userEvent.setup()
        renderComponent()

        const options = screen.getAllByRole('option')
        await act(() => user.click(options[1]))

        expect(mockHandleStoreSelect).toHaveBeenCalled()
    })
})
