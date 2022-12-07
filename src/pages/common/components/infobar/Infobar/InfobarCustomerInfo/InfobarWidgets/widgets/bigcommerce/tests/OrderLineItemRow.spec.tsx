import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'
import OrderLineItemRow from '../OrderLineItemRow'

describe('<OrderLineItemRow/>', () => {
    let onChange: jest.MockedFunction<any>,
        onDelete: jest.MockedFunction<any>,
        props: ComponentProps<typeof OrderLineItemRow>

    beforeEach(() => {
        onChange = jest.fn()
        onDelete = jest.fn()

        props = {
            id: 'line-item',
            storeHash: 'storeHash',
            currencyCode: 'USD',
            removable: true,
            onChange,
            onDelete,
            index: 0,
        } as unknown as ComponentProps<typeof OrderLineItemRow>
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    describe('render()', () => {
        it('should render', () => {
            const lineItem = bigCommerceLineItemFixture()
            const product = bigCommerceProductFixture()
            const {container} = render(
                <OrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with the default image', () => {
            const lineItem = bigCommerceLineItemFixture()
            const product = bigCommerceProductFixture()
            product.image_url = ''

            const {container} = render(
                <OrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const lineItem = bigCommerceLineItemFixture()
            lineItem.quantity = 0
            lineItem.list_price = 0
            const product = bigCommerceProductFixture()

            const {container} = render(
                <OrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('on quantity changed', () => {
        it('should call onChange() with index and quantity', () => {
            const lineItem = bigCommerceLineItemFixture()
            const product = bigCommerceProductFixture()

            render(
                <OrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                />
            )

            fireEvent.change(screen.getByRole('textbox'), {
                target: {value: 5},
            })

            expect(onChange).toHaveBeenCalled()
        })
    })

    describe('on delete line', () => {
        it('should call onDelete() with correct index', () => {
            const lineItem = bigCommerceLineItemFixture()
            const product = bigCommerceProductFixture()

            render(
                <OrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                />
            )
            fireEvent.click(screen.getByText('close'))

            expect(onDelete).toHaveBeenCalledWith(0)
        })
    })
})
