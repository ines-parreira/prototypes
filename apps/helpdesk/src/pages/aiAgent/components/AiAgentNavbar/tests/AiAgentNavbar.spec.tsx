import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { ThemeProvider } from 'core/theme'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import type { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { AiAgentNavbar } from '../AiAgentNavbar'

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')

const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const defaultStoreConfiguration = getStoreConfigurationFixture()
const queryClient = mockQueryClient()

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

jest.mock('../../ShoppingAssistant/ShoppingAssistantPromoCard', () => ({
    ShoppingAssistantPromoCard: () => <div>ShoppingAssistantPromoCard</div>,
}))

// Mock useActionDrivenNavbarSections to prevent complex hook interactions
jest.mock('../useActionDrivenNavbarSections', () => ({
    useActionDrivenNavbarSections: () => ({
        selectedStore: 'teststore1',
        selectedStoreIntegration: { id: 99, name: 'teststore1' },
        storeIntegrations: [],
        handleStoreSelect: jest.fn(),
        getStoreActivationStatus: jest.fn(() => false),
        getChannelStatus: jest.fn(() => 'inactive'),
        navigationItems: [],
        expandedSections: [],
        handleExpandedSectionsChange: jest.fn(),
    }),
}))

jest.mock('../ActionDrivenNavigation', () => ({
    ActionDrivenNavigation: jest.fn(() => <div>ActionDrivenNavigation</div>),
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

const mockedOnboardingHook = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentOnboardingState',
).useAiAgentOnboardingState as jest.Mock

const mockActionDrivenNavigation = jest.requireMock('../ActionDrivenNavigation')
    .ActionDrivenNavigation as jest.Mock

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app/ai-agent/shopify/teststore1/optimize">
        <NavBarProvider>{children}</NavBarProvider>
    </StaticRouter>
)

const integrations = (fromJS(integrationsState) as Map<any, any>).mergeIn(
    ['integrations'],
    fromJS([
        {
            id: 99,
            name: 'teststore1',
            deleted_datetime: null,
            meta: {
                shop_name: 'teststore1',
            },
            deactivated_datetime: null,
            type: 'shopify',
        },
        {
            id: 100,
            name: 'teststore2',
            deleted_datetime: null,
            meta: {
                shop_name: 'teststore2',
            },
            deactivated_datetime: null,
            type: 'shopify',
        },
        {
            id: 101,
            name: 'teststore3',
            deleted_datetime: null,
            meta: {
                shop_name: 'teststore3',
            },
            deactivated_datetime: null,
            type: 'shopify',
        },
        {
            id: 102,
            name: 'teststore4',
            deleted_datetime: null,
            meta: {
                shop_name: 'teststore4',
            },
            deactivated_datetime: null,
            type: 'shopify',
        },
    ]),
)

const defaultState: Partial<RootState> = {
    currentUser: fromJS(user),
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations,
}

const renderNavbar = ({ store }: { store?: Partial<RootState> } = {}) =>
    render(
        <QueryClientProvider client={queryClient}>
            <Provider
                store={mockStore({
                    ...defaultState,
                    ...store,
                })}
            >
                <ThemeProvider>
                    <AiAgentNavbar />
                </ThemeProvider>
            </Provider>
        </QueryClientProvider>,
        { wrapper },
    )

describe('<AiAgentNavbar />', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentOnboardingWizard || false,
        )

        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: defaultStoreConfiguration,
            isLoading: false,
            isFetched: true,
            error: null,
        })

        // Reset mocked ActionDrivenNavigation to default behavior
        mockActionDrivenNavigation.mockImplementation(() => (
            <div>ActionDrivenNavigation</div>
        ))
    })

    describe('render()', () => {
        it('should render ai agent navbar with ActionDrivenNavigation', async () => {
            renderNavbar({
                store: {
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                },
            })

            // ActionDrivenNavigation is always rendered now
            expect(
                screen.getByText('ActionDrivenNavigation'),
            ).toBeInTheDocument()
        })

        it('should not render ai agent navbar without automate', () => {
            const { queryByText } = renderNavbar()

            expect(queryByText('teststore1')).not.toBeInTheDocument()
        })

        it('should render ActionDrivenNavigation when wizard is not completed', () => {
            mockedOnboardingHook.mockReturnValue('onboardingWizard')

            // Mock the ActionDrivenNavigation to include Get Started when in onboarding wizard state
            mockActionDrivenNavigation.mockImplementation(() => (
                <div>
                    ActionDrivenNavigation
                    <div>Get Started</div>
                </div>
            ))

            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    wizard: {
                        stepName: AiAgentOnboardingWizardStep.Knowledge,
                        stepData: {
                            enabledChannels: null,
                            isAutoresponderTurnedOff: null,
                            onCompletePathway: null,
                        },
                        completedDatetime: null,
                    },
                },
                isLoading: false,
                isFetched: true,
                error: null,
            })
            const { queryByText } = renderNavbar({
                store: {
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                },
            })

            expect(queryByText('Get Started')).toBeInTheDocument()
        })
        it('should render ai agent Get Started option', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    wizard: {
                        stepName: AiAgentOnboardingWizardStep.Knowledge,
                        stepData: {
                            enabledChannels: null,
                            isAutoresponderTurnedOff: null,
                            onCompletePathway: null,
                        },
                        completedDatetime: null,
                    },
                },
                isLoading: false,
                isFetched: true,
                error: null,
            })
            const { queryByText } = renderNavbar({
                store: {
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                },
            })

            expect(queryByText('ActionDrivenNavigation')).toBeInTheDocument()
        })

        it('should render no stores', () => {
            const { queryByText } = renderNavbar({
                store: {
                    integrations: (
                        fromJS(integrationsState) as Map<any, any>
                    ).mergeIn(['integrations'], fromJS([])),
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                },
            })

            expect(queryByText('teststore1')).not.toBeInTheDocument()
        })

        it('should render ActionDrivenNavigation with automate subscription', () => {
            const { queryByText } = renderNavbar({
                store: {
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                },
            })

            expect(queryByText('ActionDrivenNavigation')).toBeInTheDocument()
        })

        it('should not render Overview menu item when there is no store connected', () => {
            const { queryByText } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                        integrations: fromJS({
                            integrations: [],
                        }),
                    })}
                >
                    <ThemeProvider>
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('Overview')).not.toBeInTheDocument()
        })

        it('should render ActionDrivenNavigation when ActionsInternalPlatform flag is true', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ActionsInternalPlatform) {
                    return true
                }
                return false
            })

            const { queryByText } = renderNavbar({
                store: {
                    integrations,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                },
            })

            expect(queryByText('ActionDrivenNavigation')).toBeInTheDocument()
        })

        describe('ActionDrivenNavigation (always rendered)', () => {
            it('should always render ActionDrivenNavigation', () => {
                const { queryByText } = renderNavbar({
                    store: {
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    },
                })

                expect(
                    queryByText('ActionDrivenNavigation'),
                ).toBeInTheDocument()
            })

            it('should not render the old navbar sections', () => {
                const { queryByText } = renderNavbar({
                    store: {
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    },
                })

                expect(queryByText('teststore1')).not.toBeInTheDocument()
                expect(queryByText('teststore2')).not.toBeInTheDocument()
                expect(queryByText('Optimize')).not.toBeInTheDocument()
                expect(queryByText('Knowledge')).not.toBeInTheDocument()
            })
        })
    })
})
