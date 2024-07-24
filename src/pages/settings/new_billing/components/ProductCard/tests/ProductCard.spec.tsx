import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'

import {ProductType} from 'models/billing/types'
import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    basicYearlyAutomationPlan,
    products,
} from 'fixtures/productPrices'
import ProductCard from '../ProductCard'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                },
            },
        }),
        products,
    }),
})

describe('ProductCard', () => {
    it('should render a Helpdesk ProductCard component', () => {
        const {container} = render(
            <Provider store={store}>
                <ProductCard
                    type={ProductType.Helpdesk}
                    plan={basicMonthlyHelpdeskPlan}
                    isDisabled={false}
                />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render an active ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                />
            </Provider>
        )
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Manage')).toBeInTheDocument()
    })

    it('should render an inactive ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard type={ProductType.Automation} isDisabled={false} />
            </Provider>
        )

        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getByText('Subscribe')).toBeInTheDocument()
    })

    it('should render a disabled ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard type={ProductType.Automation} isDisabled={true} />
            </Provider>
        )

        expect(
            screen.getByRole('button', {
                name: 'lock Subscribe',
            })
        ).toHaveAttribute('aria-disabled', 'true')
    })
})
