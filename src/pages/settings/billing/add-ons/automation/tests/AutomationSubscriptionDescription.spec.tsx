import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import _cloneDeep from 'lodash/cloneDeep'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    account,
    automationSubscriptionProductPrices,
    discountedAutomationAddOnProductPrices,
    legacyWithoutAutomationAddOnProductPrices,
} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    basicDiscountedAutomationPrice,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {RootState, StoreDispatch} from 'state/types'

import AutomationSubscriptionDescription from '../AutomationSubscriptionDescription'
import * as billingFixtures from '../../../../../../fixtures/billing'

jest.mock('launchdarkly-react-client-sdk')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const DATE_TO_USE = new Date('2019-09-03')
jest.spyOn(Date, 'now').mockImplementation(() => DATE_TO_USE.getTime())

const mockUseFlags = useFlags as jest.Mock

describe('<AutomationSubscriptionDescription />', () => {
    window.GORGIAS_SUPPORT_EMAIL = 'support@gorgias.com'

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
            },
        }),
        billing: fromJS(billingState),
    }

    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.BillingEndOfCycleDowngradeMessaging]: false,
        })
    })

    it('should render for customers without any addon features', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['created_datetime'],
                        '2021-10-04T00:00:00Z'
                    ),
                })}
            >
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render for customers already with full add-on features', () => {
        const {container} = render(
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
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a message informing that the changes will not go into effect until the end of the billing cycle', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.BillingEndOfCycleDowngradeMessaging]: true,
        })

        const {getByText} = render(
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
                <AutomationSubscriptionDescription />
            </Provider>
        )

        const msg =
            /The change in your subscription will take effect at the end of your billing cycle. If you cancel, you will lose access to self-service as soon as the change is effective./
        expect(getByText(msg)).toBeInTheDocument()
    })

    it('should render for customers with legacy automation add-on', () => {
        const productsWithLegacy = _cloneDeep(products)
        productsWithLegacy[0].prices.push(legacyBasicHelpdeskPrice)
        productsWithLegacy[1].prices.push(legacyBasicAutomationPrice)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: legacyWithoutAutomationAddOnProductPrices,
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithLegacy,
                    }),
                })}
            >
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a discounted price for customers with automation add-on discount', () => {
        const productsWithDiscountedAutomationPrice = _cloneDeep(products)
        productsWithDiscountedAutomationPrice[1].prices.push(
            basicDiscountedAutomationPrice
        )

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: discountedAutomationAddOnProductPrices,
                        },
                    }),
                    billing: fromJS({
                        ...billingFixtures.billingState,
                        products: productsWithDiscountedAutomationPrice,
                    }),
                })}
            >
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
