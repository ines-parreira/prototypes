import type { ReactNode } from 'react'

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
import { assumeMock } from 'utils/testing'

import { AiAgentNavbarV2 } from '../AiAgentNavbarV2'

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')

const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const defaultStoreConfiguration = getStoreConfigurationFixture()

jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = jest.mocked(useFlags)

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

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
        <Provider
            store={mockStore({
                ...defaultState,
                ...store,
            })}
        >
            <ThemeProvider>
                <AiAgentNavbarV2 />
            </ThemeProvider>
        </Provider>,
        { wrapper },
    )

describe('<AiAgentNavbarV2 />', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentOptimizeTab]: true,
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
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
                    })}
                >
                    <ThemeProvider>
                        <AiAgentNavbarV2 />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

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
                        <AiAgentNavbarV2 />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('Overview')).not.toBeInTheDocument()
        })

        it('should render ai agent navbar with actions internal platform', () => {
            mockUseFlag.mockReturnValue(true)

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
    })
})
