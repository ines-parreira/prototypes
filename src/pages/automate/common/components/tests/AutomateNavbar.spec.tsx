import React from 'react'
import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { FeatureFlagKey } from 'config/featureFlags'
import { AGENT_ROLE } from 'config/user'
import { useFlag } from 'core/flags'
import { ThemeProvider } from 'core/theme'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentItemEnabled } from 'pages/aiAgent/hooks/useAiAgentItemEnabled'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { RootState } from 'state/types'
import { assumeMock } from 'utils/testing'

import AutomateNavbar from '../AutomateNavbar'

jest.mock('utils/launchDarkly')
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('launchdarkly-react-client-sdk')
const allFlagsMock = assumeMock(useFlags)
allFlagsMock.mockReturnValue({})

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const defaultStoreConfiguration = getStoreConfigurationFixture()

const mockUseFlag = useFlag as jest.Mock

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

jest.mock('pages/aiAgent/hooks/useAiAgentItemEnabled')
const useAiAgentItemEnabledMock = assumeMock(useAiAgentItemEnabled)

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app">
        <NavBarProvider>{children}</NavBarProvider>
    </StaticRouter>
)

describe('<AutomateNavbar />', () => {
    beforeEach(() => {
        useAiAgentItemEnabledMock.mockReturnValue(false)
        mockUseFlag.mockReturnValue(false)
        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: defaultStoreConfiguration,
            isLoading: false,
        })
    })

    const defaultState: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
    }
    const integrations = (fromJS(integrationsState) as Map<any, any>).mergeIn(
        ['integrations'],
        fromJS([
            {
                id: 99,
                name: 'gorgiastest',
                deleted_datetime: null,
                meta: {
                    shop_name: 'gorgiastest',
                },
                deactivated_datetime: null,
                type: 'shopify',
            },
        ]),
    )

    describe('render()', () => {
        it('should render automate navbar for agent without Automate and without legacy automate features', () => {
            const { container } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            ...account,
                            created_datetime:
                                '2022-08-23T01:38:52.479339+00:00',
                        }),
                        currentUser: fromJS({
                            ...user,
                            role: { name: AGENT_ROLE },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar for agent with Automate', () => {
            const { container } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                        currentUser: fromJS({
                            ...user,
                            role: { name: AGENT_ROLE },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar for admin without Automate and without legacy automate features', () => {
            const { container } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            ...account,
                            created_datetime:
                                '2022-08-23T01:38:52.479339+00:00',
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar for admin with Automate', () => {
            const { container } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar with actions internal platform', () => {
            mockUseFlag.mockReturnValue(true)

            const { queryByText } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('Actions platform')).toBeInTheDocument()
        })

        it('should render AI Agent overview menu item when flag StandaloneConvAiOverviewPage is ON and AI Agent menu item is not enabled', () => {
            useAiAgentItemEnabledMock.mockReturnValue(false)
            allFlagsMock.mockReturnValue({
                [FeatureFlagKey.StandaloneConvAiOverviewPage]: true,
            })

            render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(screen.getByText('AI Agent Overview')).toBeInTheDocument()
        })

        it('should not render AI Agent overview menu item when flag StandaloneConvAiOverviewPage is ON and AI Agent menu item is enabled', () => {
            useAiAgentItemEnabledMock.mockReturnValue(true)
            allFlagsMock.mockReturnValue({
                [FeatureFlagKey.StandaloneConvAiOverviewPage]: true,
            })

            const { queryByText } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('AI Agent Overview')).not.toBeInTheDocument()
        })

        it('should not render AI Agent overview menu item when flag StandaloneConvAiOverviewPage is OFF and AI Agent menu item is enabled', () => {
            useAiAgentItemEnabledMock.mockReturnValue(true)
            allFlagsMock.mockReturnValue({
                [FeatureFlagKey.StandaloneConvAiOverviewPage]: false,
            })

            const { queryByText } = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: automationSubscriptionProductPrices,
                            },
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>,
                { wrapper },
            )

            expect(queryByText('AI Agent Overview')).not.toBeInTheDocument()
        })
    })
})
