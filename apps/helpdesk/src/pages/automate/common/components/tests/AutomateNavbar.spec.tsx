import type { ReactNode } from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { AGENT_ROLE } from 'config/user'
import { ThemeProvider } from 'core/theme'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import type { RootState } from 'state/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

import AutomateNavbar from '../AutomateNavbar'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const defaultStoreConfiguration = getStoreConfigurationFixture()

const mockUseFlag = useFlag as jest.Mock
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

const wrapper = ({ children }: { children?: ReactNode }) => (
    <MemoryRouter initialEntries={['/app']}>
        <NavBarProvider>{children}</NavBarProvider>
    </MemoryRouter>
)

describe('<AutomateNavbar />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: defaultStoreConfiguration,
            isLoading: false,
            isFetched: true,
            error: null,
        })
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
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
        it('should render automate navbar for agent without AI Agent and without legacy automate features', () => {
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

        it('should render automate navbar for admin without AI Agent and without legacy automate features', () => {
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

        it('should always render AI Agent overview menu item', () => {
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
    })
})
