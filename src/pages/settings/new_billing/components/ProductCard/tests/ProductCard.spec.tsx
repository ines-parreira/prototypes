import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'

import {ProductType} from 'models/billing/types'
import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPrice,
    basicYearlyAutomationPrice,
    products,
} from 'fixtures/productPrices'
import ProductCard from '../ProductCard'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
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
                    product={basicMonthlyHelpdeskPrice}
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
                    product={basicYearlyAutomationPrice}
                />
            </Provider>
        )
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Update Plan')).toBeInTheDocument()
    })

    it('should render an inactive ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard type={ProductType.Automation} />
            </Provider>
        )

        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getByText('Subscribe')).toBeInTheDocument()
    })
})
