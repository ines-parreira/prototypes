import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { ThemeProvider } from 'core/theme'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { AiAgentNavbar } from '../AiAgentNavbar'

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')

const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const defaultStoreConfiguration = getStoreConfigurationFixture()
const queryClient = mockQueryClient()

jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = jest.mocked(useFlags)

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock('../ActionDrivenNavigation', () => ({
    ActionDrivenNavigation: () => <div>ActionDrivenNavigation</div>,
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
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentOptimizeTab]: true,
            [FeatureFlagKey.AiAgentOnboardingWizard]: true,
        })

        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: defaultStoreConfiguration,
            isLoading: false,
            isFetched: true,
            error: null,
        })
    })

    describe('render()', () => {
        it('should render ai agent navbar with all options', async () => {
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

            expect(screen.getByText('teststore1')).toBeInTheDocument()
            expect(screen.getByText('teststore2')).toBeInTheDocument()
            expect(screen.getByText('teststore3')).toBeInTheDocument()
            expect(screen.getByText('teststore4')).toBeInTheDocument()

            expect(screen.getByText('Optimize')).toBeInTheDocument()
            expect(screen.getByText('Knowledge')).toBeInTheDocument()
            expect(screen.getByText('Settings')).toBeInTheDocument()
            expect(screen.getByText('Test')).toBeInTheDocument()
        })

        it('should not render ai agent navbar without automate', () => {
            const { queryByText } = renderNavbar()

            expect(queryByText('teststore1')).not.toBeInTheDocument()
        })

        it('should render ai agent Get Started option', () => {
            mockedOnboardingHook.mockReturnValue('onboardingWizard')
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
            const { queryByText, queryAllByText } = renderNavbar({
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

            expect(queryByText('teststore1')).toBeInTheDocument()
            expect(queryAllByText('Optimize').length).toBe(0)
            expect(queryAllByText('Get Started').length).toBeGreaterThanOrEqual(
                1,
            )
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

        it('should always render Overview menu item when flag', () => {
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

            expect(queryByText('Overview')).toBeInTheDocument()
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

        it('should render ai agent navbar with actions internal platform', () => {
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

            expect(queryByText('Actions platform')).toBeInTheDocument()
        })

        describe('ActionDrivenAiAgentNavigation feature flag', () => {
            it('should render ActionDrivenNavigation when feature flag is enabled', () => {
                mockUseFlag.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.ActionDrivenAiAgentNavigation) {
                        return true
                    }
                    return false
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

                expect(
                    queryByText('ActionDrivenNavigation'),
                ).toBeInTheDocument()
                expect(queryByText('Overview')).not.toBeInTheDocument()
            })

            it('should render regular navigation when feature flag is disabled', () => {
                mockUseFlag.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.ActionDrivenAiAgentNavigation) {
                        return false
                    }
                    return false
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

                expect(
                    queryByText('ActionDrivenNavigation'),
                ).not.toBeInTheDocument()
                expect(queryByText('Overview')).toBeInTheDocument()
            })

            it('should not render the regular navbar sections when feature flag is enabled', () => {
                mockUseFlag.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.ActionDrivenAiAgentNavigation) {
                        return true
                    }
                    return false
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

                expect(queryByText('teststore1')).not.toBeInTheDocument()
                expect(queryByText('teststore2')).not.toBeInTheDocument()
                expect(queryByText('Optimize')).not.toBeInTheDocument()
                expect(queryByText('Knowledge')).not.toBeInTheDocument()
            })
        })
    })
})
