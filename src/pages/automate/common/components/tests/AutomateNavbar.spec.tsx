import {render, screen} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {useFlag} from 'common/flags'
import {AGENT_ROLE} from 'config/user'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {integrationsState} from 'fixtures/integrations'
import {user} from 'fixtures/users'
import {getStoreConfigurationFixture} from 'pages/automate/aiAgent/fixtures/storeConfiguration.fixtures'
import {useStoreConfiguration} from 'pages/automate/aiAgent/hooks/useStoreConfiguration'
import {RootState} from 'state/types'
import {ThemeProvider} from 'theme'
import {getLDClient} from 'utils/launchDarkly'

import {assumeMock} from 'utils/testing'

import AutomateNavbar from '../AutomateNavbar'

jest.mock('utils/launchDarkly')
jest.mock('react-router')
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('pages/automate/aiAgent/hooks/useStoreConfiguration')

const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})
const useParamsMock = useParams as jest.Mock
useParamsMock.mockReturnValue({})

const mockStore = configureMockStore()
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)
const defaultStoreConfiguration = getStoreConfigurationFixture()

const mockUseFlag = useFlag as jest.Mock

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

describe('<AutomateNavbar />', () => {
    beforeEach(() => {
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
        ])
    )

    describe('render()', () => {
        it('should render automate navbar for agent without Automate and without legacy automate features', () => {
            const {container} = render(
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
                            role: {name: AGENT_ROLE},
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar for agent with Automate', () => {
            const {container} = render(
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
                            role: {name: AGENT_ROLE},
                        }),
                    })}
                >
                    <DndProvider backend={HTML5Backend}>
                        <ThemeProvider>
                            <AutomateNavbar />
                        </ThemeProvider>
                    </DndProvider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar for admin without Automate and without legacy automate features', () => {
            const {container} = render(
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
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar for admin with Automate', () => {
            const {container} = render(
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
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automate navbar with actions internal platform', () => {
            mockUseFlag.mockReturnValue(true)

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
                </Provider>
            )

            expect(screen.getByText('Actions platform')).toBeInTheDocument()
        })
    })
})
