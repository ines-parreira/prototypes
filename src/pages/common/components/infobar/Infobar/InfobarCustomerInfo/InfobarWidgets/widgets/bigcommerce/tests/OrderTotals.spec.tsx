import React from 'react'
import {render} from '@testing-library/react'
import {
    bigCommerceCartFixture,
    bigCommerceIntegrationFixture,
} from 'fixtures/bigcommerce'
import OrderTotals from '../OrderTotals'

describe('<OrderTotals/>', () => {
    describe('rendering', () => {
        it('should render', () => {
            const cart = bigCommerceCartFixture()
            const integration = bigCommerceIntegrationFixture()

            const {container} = render(
                <OrderTotals cart={cart} integration={integration} />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
