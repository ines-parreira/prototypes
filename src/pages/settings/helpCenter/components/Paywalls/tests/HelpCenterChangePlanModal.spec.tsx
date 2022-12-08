import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import _cloneDeep from 'lodash/cloneDeep'
import {RootState, StoreDispatch} from 'state/types'
import BillingPlanCard from 'pages/settings/billing/plans/BillingPlanCard'
import {billingState} from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {automationSubscriptionProductPrices} from 'fixtures/account'
import HelpCenterChangePlanModal from '../HelpCenterChangePlanModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockedHandleSubscriptionUpdate = jest.fn()
jest.mock('react-use', () => {
    return {
        ...require.requireActual('react-use'),
        useAsyncFn: () => [{loading: false}, mockedHandleSubscriptionUpdate],
    } as Record<string, unknown>
})

jest.mock(
    'pages/settings/billing/plans/BillingPlanCard',
    () =>
        ({
            amount,
            currency,
            features,
            interval,
            name,
            theme,
            className,
        }: ComponentProps<typeof BillingPlanCard>) =>
            (
                <div>
                    BillingPlanCard mock,
                    <div>theme: {theme}</div>
                    <div>className: {className}</div>
                    <div>amount: {amount}</div>
                    <div>currency: {currency}</div>
                    <div>interval: {interval}</div>
                    <div>name: {name}</div>
                    <div>features: {features.toString()}</div>
                </div>
            )
)

describe('HelpCenterChangePlanModal', () => {
    const props = {
        isOpen: true,
        helpdeskPrice: legacyBasicHelpdeskPrice,
        onClose: jest.fn(),
    }

    it('should upgrade plan when clicking on the "Upgrade" button', async () => {
        const productWithLegacyPrice = _cloneDeep(products)
        productWithLegacyPrice[0].prices.push(legacyBasicHelpdeskPrice)

        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            legacyBasicHelpdeskPrice.price_id,
                    },
                },
            }),
            billing: fromJS({
                ...billingState,
                products: productWithLegacyPrice,
            }),
        }
        const {findByRole} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterChangePlanModal {...props} />
            </Provider>
        )

        const upgradeButton = await findByRole('button', {
            name: /confirm upgrade/i,
        })

        fireEvent.click(upgradeButton)

        expect(mockedHandleSubscriptionUpdate).toHaveBeenCalledWith([
            legacyBasicHelpdeskPrice.price_id,
        ])
    })

    it('should render the automation plan card when current plan has automation enabled', () => {
        const state: Partial<RootState> = {
            billing: fromJS(billingState),
            currentAccount: fromJS({
                current_subscription: {
                    products: automationSubscriptionProductPrices,
                },
            }),
        }
        const {baseElement} = render(
            <Provider store={mockStore(state)}>
                <HelpCenterChangePlanModal
                    {...props}
                    helpdeskPrice={basicMonthlyHelpdeskPrice}
                />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })
})
