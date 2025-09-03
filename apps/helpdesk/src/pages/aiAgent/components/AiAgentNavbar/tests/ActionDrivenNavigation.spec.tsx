import { FeatureFlagKey } from '@repo/feature-flags'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { IntegrationType } from 'models/integration/constants'
import { StoreIntegration } from 'models/integration/types'

import { ActionDrivenNavigation } from '../ActionDrivenNavigation'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(() => ({})),
}))
const mockUseFlag = jest.mocked(useFlag)

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
                            aria-selected={selected?.id === integration.id}
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
        SectionItem: ({ children, to, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        ),
    },
}))

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState', () => ({
    __esModule: true,
    OnboardingState: {
        Loading: 'loading',
        OnboardingWizard: 'onboardingWizard',
        Onboarded: 'onboarded',
    },
    useAiAgentOnboardingState: jest.fn(() => 'onboarded'),
}))

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess', () => ({
    useTrialAccess: jest.fn(() => ({
        hasAnyTrialOptedOut: false,
        hasAnyTrialOptedIn: false,
        hasAnyTrialActive: false,
        hasAnyTrialExpired: false,
        hasAnyTrialStarted: false,
    })),
}))

// Mock useStoreConfigurations to prevent the error
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: jest.fn(() => ({
        storeActivations: {},
        isFetchLoading: false,
    })),
    useStoreConfigurations: jest.fn(() => ({
        storeConfigurations: [],
        storeNames: [],
        isLoading: false,
    })),
}))

const mockedOnboardingHook = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentOnboardingState',
).useAiAgentOnboardingState as jest.Mock

// We don't need to reference this mock since we're not changing its behavior in tests
const __mockedTrialAccessHook = jest.requireMock(
    'pages/aiAgent/trial/hooks/useTrialAccess',
).useTrialAccess as jest.Mock

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
        route: '/app/ai-agent/shopify/test-store',
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
        mockUseFlag.mockReturnValue(false)
        mockedOnboardingHook.mockReturnValue('onboarded')
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

    const mockStore = configureMockStore()
    const initialState = {}

    const renderComponent = () => {
        const store = mockStore(initialState)
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    <ActionDrivenNavigation />
                </MemoryRouter>
            </Provider>,
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

    it('renders Actions platform link when flag enabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.ActionsInternalPlatform || false,
        )

        renderComponent()

        const link = screen.getByText('Actions platform')
        expect(link).toBeInTheDocument()
        expect((link as HTMLAnchorElement).getAttribute('href')).toBe(
            '/app/ai-agent/actions-platform',
        )
    })

    it('renders Get Started and hides nav items when in onboarding', () => {
        mockUseFlag.mockReturnValue(true)
        mockedOnboardingHook.mockReturnValue('onboardingWizard')
        mockGetStoreActivationStatus.mockReturnValue(false)

        renderComponent()

        expect(screen.getByText('Try for free')).toBeInTheDocument()
        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
        expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
    })

    it('shows nav items when store is onboarded but not active', () => {
        mockedOnboardingHook.mockReturnValue('onboarded')
        mockGetStoreActivationStatus.mockReturnValue(false)

        renderComponent()

        expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Analyze')).toBeInTheDocument()
    })

    it('shows nav items when store is active (regardless of onboarding)', () => {
        mockedOnboardingHook.mockReturnValue('onboardingWizard')
        mockGetStoreActivationStatus.mockReturnValue(true)

        renderComponent()

        expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
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

        // It is called at least once during render to compute the active status dot
        expect(mockGetStoreActivationStatus).toHaveBeenCalled()
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
