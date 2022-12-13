import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {user} from 'fixtures/users'
import {
    account,
    automationSubscriptionProductPrices,
    legacyWithoutAutomationAddOnProductPrices,
} from 'fixtures/account'
import {AGENT_ROLE, BASIC_AGENT_ROLE} from 'config/user'
import {RootState} from 'state/types'
import {billingState} from 'fixtures/billing'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'
import {integrationsState} from 'fixtures/integrations'
import {
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
} from 'fixtures/productPrices'

import AutomationNavbar from '../AutomationNavbar'

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.AutomationSettingsRevamp]: true})

const mockStore = configureMockStore()

describe('<AutomationNavbar />', () => {
    const defaultState: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
    }
    const integrations = (fromJS(integrationsState) as Map<any, any>).mergeDeep(
        fromJS({
            integrations: [
                {
                    deleted_datetime: null,
                    meta: {
                        shop_name: 'My shop',
                    },
                    deactivated_datetime: null,
                    type: 'shopify',
                },
            ],
        })
    )

    describe('render()', () => {
        it('should render automation navbar for non-agent user without automation add-on', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentUser: fromJS({
                            ...user,
                            role: {name: BASIC_AGENT_ROLE},
                        }),
                    })}
                >
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for non-agent user with automation add-on', () => {
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
                            role: {name: BASIC_AGENT_ROLE},
                        }),
                    })}
                >
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for agent without automation add-on and without legacy automation features', () => {
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
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for agent with legacy automation features', () => {
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
                                products:
                                    legacyWithoutAutomationAddOnProductPrices,
                            },
                        }),
                        billing: fromJS({
                            ...billingState,
                            products: [
                                {
                                    ...billingState.products[0],
                                    prices: [
                                        ...billingState.products[0].prices,
                                        legacyBasicHelpdeskPrice,
                                    ],
                                },
                                {
                                    ...billingState.products[1],
                                    prices: [
                                        ...billingState.products[1].prices,
                                        legacyBasicAutomationPrice,
                                    ],
                                },
                            ],
                        }),
                    })}
                >
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for agent with automation add-on', () => {
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
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for admin without automation add-on and without legacy automation features', () => {
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
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for admin with legacy automation features', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products:
                                    legacyWithoutAutomationAddOnProductPrices,
                            },
                        }),
                        billing: fromJS({
                            ...billingState,
                            products: [
                                {
                                    ...billingState.products[0],
                                    prices: [
                                        ...billingState.products[0].prices,
                                        legacyBasicHelpdeskPrice,
                                    ],
                                },
                                {
                                    ...billingState.products[1],
                                    prices: [
                                        ...billingState.products[1].prices,
                                        legacyBasicAutomationPrice,
                                    ],
                                },
                            ],
                        }),
                    })}
                >
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render automation navbar for admin with automation add-on', () => {
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
                    <AutomationNavbar />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
