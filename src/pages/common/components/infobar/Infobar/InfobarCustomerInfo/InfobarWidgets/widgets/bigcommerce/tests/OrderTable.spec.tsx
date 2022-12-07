import {render} from '@testing-library/react'
import React from 'react'
import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'
import OrderTable from '../OrderTable'

const lineItems = [bigCommerceLineItemFixture()]
const product = bigCommerceProductFixture()
const storeHash = 'testHash'
const currencyCode = 'USD'
const onLineItemUpdate = jest.fn()
const onLineItemDelete = jest.fn()
const products = new Map()
products.set(product.id, product)

const minProps = {
    lineItems,
    products,
    storeHash,
    currencyCode,
    onLineItemUpdate,
    onLineItemDelete,
}

describe('<OrderTable/>', () => {
    describe('rendering', () => {
        it('should render with items', () => {
            const {container} = render(<OrderTable {...minProps} />)

            expect(container).toMatchSnapshot()
        })

        it('should render without items', () => {
            minProps.lineItems = []
            minProps.products = new Map()
            const {container} = render(<OrderTable {...minProps} />)

            expect(container).toMatchSnapshot()
        })
    })
})
