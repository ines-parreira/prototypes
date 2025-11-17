import { FeatureFlagKey } from '@repo/feature-flags'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { IntegrationType } from 'models/integration/constants'
import type { StoreIntegration } from 'models/integration/types'

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
        hasCurrentStoreTrialOptedOut: false,
        hasCurrentStoreTrialExpired: false,
        hasCurrentStoreTrialStarted: false,
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

// Mock useCanEnableAiAgentDuringTrial
jest.mock('hooks/aiAgent/useCanUseAiAgent', () => ({
    useCanUseAiAgent: jest.fn(() => ({
        isCurrentStoreDuringTrial: true,
        hasAnyActiveTrial: true,
    })),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(() => ({
        hasAccess: true,
        isLoading: false,
    })),
}))

// Mock useAppSelector
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}))

const mockedOnboardingHook = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentOnboardingState',
).useAiAgentOnboardingState as jest.Mock

const mockedTrialAccessHook = jest.requireMock(
    'pages/aiAgent/trial/hooks/useTrialAccess',
).useTrialAccess as jest.Mock

const mockedCanUseAiAgent = jest.requireMock('hooks/aiAgent/useCanUseAiAgent')
    .useCanUseAiAgent as jest.Mock

const mockedUseAiAgentAccess = jest.requireMock(
    'hooks/aiAgent/useAiAgentAccess',
).useAiAgentAccess as jest.Mock

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

        mockedOnboardingHook.mockReturnValue('onboarded')
        mockedTrialAccessHook.mockReturnValue({
            hasAnyTrialOptedOut: false,
            hasAnyTrialOptedIn: false,
            hasAnyTrialActive: false,
            hasAnyTrialExpired: false,
            hasAnyTrialStarted: false,
            hasCurrentStoreTrialOptedOut: false,
            hasCurrentStoreTrialExpired: false,
            hasCurrentStoreTrialStarted: false,
        })
        mockedCanUseAiAgent.mockReturnValue({
            isCurrentStoreDuringTrial: true,
            hasAnyActiveTrial: true,
        })
        mockedUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
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
        mockGetStoreActivationStatus.mockReturnValue(true)
        renderComponent()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Analyze')).toBeInTheDocument()
    })

    it('renders Actions platform link when flag enabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.ActionsInternalPlatform,
        )

        renderComponent()

        const link = screen.getByText('Actions platform')
        expect(link).toBeInTheDocument()
        expect((link as HTMLAnchorElement).getAttribute('href')).toBe(
            '/app/ai-agent/actions-platform',
        )
    })

    it('renders Try for free and hides nav items when in onboarding', () => {
        mockedOnboardingHook.mockReturnValue('onboardingWizard')
        mockGetStoreActivationStatus.mockReturnValue(false)
        mockedTrialAccessHook.mockReturnValue({
            hasCurrentStoreTrialOptedOut: false,
            hasCurrentStoreTrialExpired: false,
            hasCurrentStoreTrialStarted: false,
        })

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

    it('renders Get Started for stores with trial history', () => {
        mockedOnboardingHook.mockReturnValue('onboardingWizard')
        mockGetStoreActivationStatus.mockReturnValue(false)
        mockedTrialAccessHook.mockReturnValue({
            hasCurrentStoreTrialStarted: true,
        })

        renderComponent()

        expect(screen.getByText('Get started')).toBeInTheDocument()
    })

    describe('hasAccess scenarios', () => {
        describe('when hasAccess is true (with access via plan or trial)', () => {
            beforeEach(() => {
                mockedUseAiAgentAccess.mockReturnValue({
                    hasAccess: true,
                    isLoading: false,
                })
            })

            it('renders navigation items when store is onboarded', () => {
                mockedOnboardingHook.mockReturnValue('onboarded')
                mockGetStoreActivationStatus.mockReturnValue(false)

                renderComponent()

                expect(screen.getByText('Overview')).toBeInTheDocument()
                expect(screen.getByText('Analyze')).toBeInTheDocument()
            })

            it('renders navigation items when store is active', () => {
                mockedOnboardingHook.mockReturnValue('onboardingWizard')
                mockGetStoreActivationStatus.mockReturnValue(true)

                renderComponent()

                expect(screen.getByText('Overview')).toBeInTheDocument()
                expect(screen.getByText('Analyze')).toBeInTheDocument()
            })

            it('does not render collapsed item when onboarded', () => {
                mockedOnboardingHook.mockReturnValue('onboarded')
                mockGetStoreActivationStatus.mockReturnValue(false)

                renderComponent()

                expect(
                    screen.queryByText('Try for free'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Get started'),
                ).not.toBeInTheDocument()
            })

            it('does not render collapsed item when active', () => {
                mockedOnboardingHook.mockReturnValue('onboardingWizard')
                mockGetStoreActivationStatus.mockReturnValue(true)

                renderComponent()

                expect(
                    screen.queryByText('Try for free'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Get started'),
                ).not.toBeInTheDocument()
            })

            it('renders Actions platform link when flag is enabled', () => {
                mockUseFlag.mockImplementation(
                    (key) => key === FeatureFlagKey.ActionsInternalPlatform,
                )

                renderComponent()

                const link = screen.getByText('Actions platform')
                expect(link).toBeInTheDocument()
                expect((link as HTMLAnchorElement).getAttribute('href')).toBe(
                    '/app/ai-agent/actions-platform',
                )
            })

            it('does not render Actions platform link when flag is disabled', () => {
                mockUseFlag.mockReturnValue(false)

                renderComponent()

                expect(
                    screen.queryByText('Actions platform'),
                ).not.toBeInTheDocument()
            })
        })

        describe('when hasAccess is false (no plan, no trial)', () => {
            beforeEach(() => {
                mockedUseAiAgentAccess.mockReturnValue({
                    hasAccess: false,
                    isLoading: false,
                })
            })

            it('renders collapsed item and hides navigation items when in onboarding', () => {
                mockedOnboardingHook.mockReturnValue('onboardingWizard')
                mockGetStoreActivationStatus.mockReturnValue(false)
                mockedTrialAccessHook.mockReturnValue({
                    hasCurrentStoreTrialStarted: false,
                })

                renderComponent()

                expect(screen.getByText('Try for free')).toBeInTheDocument()
                expect(screen.queryByText('Overview')).not.toBeInTheDocument()
                expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
            })

            it('renders collapsed item when onboarded but not active', () => {
                mockedOnboardingHook.mockReturnValue('onboarded')
                mockGetStoreActivationStatus.mockReturnValue(false)

                renderComponent()

                expect(screen.queryByText('Overview')).not.toBeInTheDocument()
                expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
            })

            it('does not render Actions platform link even when flag is enabled', () => {
                mockUseFlag.mockImplementation(
                    (key) => key === FeatureFlagKey.ActionsInternalPlatform,
                )

                renderComponent()

                expect(
                    screen.queryByText('Actions platform'),
                ).not.toBeInTheDocument()
            })

            it('does not render navigation items when store is active but hasAccess is false', () => {
                mockedOnboardingHook.mockReturnValue('onboardingWizard')
                mockGetStoreActivationStatus.mockReturnValue(true)

                renderComponent()

                expect(screen.queryByText('Overview')).not.toBeInTheDocument()
                expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
            })
        })
    })
})
