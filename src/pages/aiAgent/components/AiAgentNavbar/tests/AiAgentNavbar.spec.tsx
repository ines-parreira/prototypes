import type { ReactNode } from 'react'
import React from 'react'

import { fireEvent, render, screen, within } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { FeatureFlagKey } from 'config/featureFlags'
import { ThemeProvider } from 'core/theme'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { useWelcomePageAcknowledged } from 'pages/aiAgent/hooks/useWelcomePageAcknowledged'
import { RootState } from 'state/types'
import { assumeMock } from 'utils/testing'

import { AiAgentNavbar } from '../AiAgentNavbar'

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('pages/aiAgent/hooks/useWelcomePageAcknowledged')

const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const useWelcomePageAcknowledgedMock = assumeMock(useWelcomePageAcknowledged)
const defaultStoreConfiguration = getStoreConfigurationFixture()

jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = jest.mocked(useFlags)

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app/ai-agent/shopify/teststore1/optimize">
        <NavBarProvider>{children}</NavBarProvider>
    </StaticRouter>
)

describe('<AiAgentNavbar />', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentOptimizeTab]: true,
            [FeatureFlagKey.AiAgentKnowledgeTab]: true,
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
            [FeatureFlagKey.AiAgentOnboardingWizard]: true,
        })

        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: defaultStoreConfiguration,
            isLoading: false,
        })

        useWelcomePageAcknowledgedMock.mockReturnValue({
            isLoading: false,
            data: {
                acknowledged: true,
            },
        })
    })

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

    describe('render()', () => {
        it('should render ai agent navbar with all options', () => {
            render(
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
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            const navbar = within(screen.getByTestId('ai-agent-navbar'))

            expect(navbar.getByText('teststore1')).toBeInTheDocument()
            expect(navbar.getByText('teststore2')).toBeInTheDocument()
            expect(navbar.getByText('teststore3')).toBeInTheDocument()
            expect(navbar.getByText('teststore4')).toBeInTheDocument()

            expect(navbar.getAllByText('Optimize').length).toBe(1)
            expect(navbar.getAllByText('Knowledge').length).toBe(1)
            expect(navbar.getAllByText('Settings').length).toBe(1)
            expect(navbar.getAllByText('Test').length).toBe(1)

            fireEvent.click(navbar.getByText('teststore4'))

            expect(navbar.getAllByText('Optimize').length).toBe(2)
            expect(navbar.getAllByText('Knowledge').length).toBe(2)
            expect(navbar.getAllByText('Settings').length).toBe(2)
            expect(navbar.getAllByText('Test').length).toBe(2)

            fireEvent.click(navbar.getByText('teststore4'))

            expect(navbar.getAllByText('Optimize').length).toBe(1)
            expect(navbar.getAllByText('Knowledge').length).toBe(1)
            expect(navbar.getAllByText('Settings').length).toBe(1)
            expect(navbar.getAllByText('Test').length).toBe(1)
        })

        it('should not render ai agent navbar without automate', () => {
            const { queryByText } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                    })}
                >
                    <ThemeProvider>
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('teststore1')).not.toBeInTheDocument()
        })

        it('should render ai agent Get Started option', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    wizard: {
                        stepName: AiAgentOnboardingWizardStep.Knowledge,
                        stepData: {
                            hasEducationStepEnabled: null,
                            enabledChannels: null,
                            isAutoresponderTurnedOff: null,
                            onCompletePathway: null,
                        },
                        completedDatetime: null,
                    },
                },
                isLoading: false,
            })
            const { queryByText, queryAllByText } = render(
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
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('teststore1')).toBeInTheDocument()
            expect(queryAllByText('Optimize').length).toBe(0)
            expect(queryAllByText('Get Started').length).toBeGreaterThanOrEqual(
                1,
            )
        })

        it('should render no stores', () => {
            const { queryByText } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
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
                    })}
                >
                    <ThemeProvider>
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('teststore1')).not.toBeInTheDocument()
        })

        it('should render Overview menu item when flag StandaloneConvAiOverviewPage true', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.StandaloneConvAiOverviewPage]: true,
            })

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
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('Overview')).toBeInTheDocument()
        })

        it('should not render Overview menu item when flag StandaloneConvAiOverviewPage true', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.StandaloneConvAiOverviewPage]: false,
            })

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
                        <AiAgentNavbar />
                    </ThemeProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('Overview')).not.toBeInTheDocument()
        })
    })
})
