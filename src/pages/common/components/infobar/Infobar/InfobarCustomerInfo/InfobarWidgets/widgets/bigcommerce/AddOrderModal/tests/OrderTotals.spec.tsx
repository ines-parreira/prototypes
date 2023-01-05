import React from 'react'
import {render} from '@testing-library/react'
import {
    bigCommerceCartFixture,
    bigCommerceCheckoutFixture,
    bigCommerceConsignmentFixture,
    bigCommerceIntegrationFixture,
} from 'fixtures/bigcommerce'
import OrderTotals from '../OrderTotals'

jest.mock('../utils', () => ({
    ...jest.requireActual<Record<string, unknown>>('../utils'),
    useCanViewBigCommerceV1Features: jest.fn(() => true),
}))

describe('<OrderTotals/>', () => {
    describe('rendering', () => {
        it('should render', () => {
            const integration = bigCommerceIntegrationFixture()

            const {container} = render(
                <OrderTotals
                    checkout={bigCommerceCheckoutFixture}
                    cart={bigCommerceCartFixture()}
                    integration={integration}
                    consignment={bigCommerceConsignmentFixture}
                    onUpdateConsignmentShippingMethod={jest.fn()}
                    onUpdateDiscountAmount={jest.fn()}
                    totals={{
                        subTotal: 78,
                        shipping: 50,
                        taxes: 15.6,
                        total: 93.6,
                    }}
                    hasShippingAddress
                    isTotalPriceLoading={false}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
