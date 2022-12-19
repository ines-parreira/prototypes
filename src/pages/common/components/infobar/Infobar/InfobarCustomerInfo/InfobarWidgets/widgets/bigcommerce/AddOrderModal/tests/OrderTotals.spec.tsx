import React from 'react'
import {render} from '@testing-library/react'
import {
    bigCommerceConsignmentFixture,
    bigCommerceIntegrationFixture,
} from 'fixtures/bigcommerce'
import OrderTotals from '../OrderTotals'

describe('<OrderTotals/>', () => {
    describe('rendering', () => {
        it('should render', () => {
            const integration = bigCommerceIntegrationFixture()

            const {container} = render(
                <OrderTotals
                    integration={integration}
                    consignment={bigCommerceConsignmentFixture}
                    onUpdateConsignmentShippingMethod={jest.fn()}
                    totals={{
                        subTotal: 78,
                        shipping: 50,
                        taxes: 15.6,
                        total: 93.6,
                    }}
                    hasShippingAddress
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
