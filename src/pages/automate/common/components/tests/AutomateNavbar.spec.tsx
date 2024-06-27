import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {useParams} from 'react-router-dom'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {user} from 'fixtures/users'
import {
    account,
    automationSubscriptionProductPrices,
    legacyWithoutAutomateProductPrices,
} from 'fixtures/account'
import {AGENT_ROLE} from 'config/user'
import {RootState} from 'state/types'
import {billingState} from 'fixtures/billing'
import {getLDClient} from 'utils/launchDarkly'
import {integrationsState} from 'fixtures/integrations'
import {
    legacyBasicAutomatePlan,
    legacyBasicHelpdeskPlan,
} from 'fixtures/productPrices'
import {ThemeProvider} from 'theme'

import AutomateNavbar from '../AutomateNavbar'

jest.mock('utils/launchDarkly')
jest.mock('react-router')

const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})
const useParamsMock = useParams as jest.Mock
useParamsMock.mockReturnValue({})

const mockStore = configureMockStore()

jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

describe('<AutomateNavbar />', () => {
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

        it('should render automate navbar for agent with legacy automate features', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentUser: fromJS({
                            ...user,
                            role: {name: AGENT_ROLE},
                        }),
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: legacyWithoutAutomateProductPrices,
                            },
                        }),
                        billing: fromJS({
                            ...billingState,
                            products: [
                                {
                                    ...billingState.products[0],
                                    prices: [
                                        ...billingState.products[0].prices,
                                        legacyBasicHelpdeskPlan,
                                    ],
                                },
                                {
                                    ...billingState.products[1],
                                    prices: [
                                        ...billingState.products[1].prices,
                                        legacyBasicAutomatePlan,
                                    ],
                                },
                            ],
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

        it('should render automate navbar for admin with legacy automate features', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: legacyWithoutAutomateProductPrices,
                            },
                        }),
                        billing: fromJS({
                            ...billingState,
                            products: [
                                {
                                    ...billingState.products[0],
                                    prices: [
                                        ...billingState.products[0].prices,
                                        legacyBasicHelpdeskPlan,
                                    ],
                                },
                                {
                                    ...billingState.products[1],
                                    prices: [
                                        ...billingState.products[1].prices,
                                        legacyBasicAutomatePlan,
                                    ],
                                },
                            ],
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
    })
})
