import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {
    advancedMonthlyHelpdeskPrice,
    basicMonthlyHelpdeskPrice,
    customAutomationPrice,
    customHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {HelpdeskPrice} from 'models/billing/types'
import {getFormattedAmount} from 'models/billing/utils'
import BillingPlanCard from '../BillingPlanCard'
import {getPlanCardFeaturesForPrices} from '../billingPlanFeatures'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('lodash/uniqueId', () => () => '42')

describe('<BillingPlanCard />', () => {
    const productPrices = _cloneDeep(products)
    productPrices[0].prices.push(legacyBasicHelpdeskPrice, customHelpdeskPrice)
    productPrices[1].prices.push(
        legacyBasicAutomationPrice,
        customAutomationPrice
    )

    const defaultState: Partial<RootState> = {
        billing: fromJS({
            ...billingState,
            products: productPrices,
        }),
        currentAccount: fromJS(account),
    }

    const minProps: ComponentProps<typeof BillingPlanCard> = {
        amount: getFormattedAmount(basicMonthlyHelpdeskPrice.amount),
        currency: basicMonthlyHelpdeskPrice.currency,
        interval: basicMonthlyHelpdeskPrice.interval,
        features: getPlanCardFeaturesForPrices(
            [basicMonthlyHelpdeskPrice],
            false
        ),
        isCurrentPrice: false,
        name: basicMonthlyHelpdeskPrice.name,
        footer: <span>Foo footer</span>,
        className: 'fooClass',
    }

    it.each<[string, HelpdeskPrice]>([
        ['Basic price', basicMonthlyHelpdeskPrice],
        ['Advanced price', advancedMonthlyHelpdeskPrice],
        ['Pro price', proMonthlyHelpdeskPrice],
        ['Custom price', customHelpdeskPrice],
        ['Legacy price', legacyBasicHelpdeskPrice],
    ])('should render plan card for the %s', (testName, price) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    amount={getFormattedAmount(price.amount)}
                    currency={price.currency}
                    interval={price.interval}
                    name={price.name}
                    features={getPlanCardFeaturesForPrices(
                        [price],
                        price.is_legacy
                    )}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render features list from the feature plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    features={getPlanCardFeaturesForPrices(
                        [proMonthlyHelpdeskPrice],
                        false
                    )}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the legacy badge for current legacy plan when the account has a legacy plan', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        [
                            'current_subscription',
                            'products',
                            HELPDESK_PRODUCT_ID,
                        ],
                        legacyBasicHelpdeskPrice.price_id
                    ),
                })}
            >
                <BillingPlanCard
                    {...minProps}
                    amount={getFormattedAmount(legacyBasicHelpdeskPrice.amount)}
                    currency={legacyBasicHelpdeskPrice.currency}
                    interval={legacyBasicHelpdeskPrice.interval}
                    name={legacyBasicHelpdeskPrice.name}
                    features={getPlanCardFeaturesForPrices(
                        [legacyBasicHelpdeskPrice],
                        true
                    )}
                    isCurrentPrice
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
