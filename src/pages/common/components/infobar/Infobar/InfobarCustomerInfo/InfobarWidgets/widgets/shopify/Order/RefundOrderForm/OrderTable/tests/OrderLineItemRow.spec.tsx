import React from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'

import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyPriceSetFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import {initRefundOrderLineItems} from '../../../../../../../../../../../../../business/shopify/order'
import OrderLineItemRow from '../OrderLineItemRow'

describe('<LineItemRow/>', () => {
    let onChange: jest.MockedFunction<any>

    beforeEach(() => {
        jest.useFakeTimers()
        onChange = jest.fn()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render', () => {
        const lineItem = fromJS(shopifyLineItemFixture({currencyCode: 'USD'}))

        const {container} = render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={0}
                isRestockable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render for multi-currency order', () => {
        const totalDiscountSet = fromJS(
            shopifyPriceSetFixture({
                amount: '0.00',
                currencyCode: 'USD',
                presentmentCurrencyCode: 'JPY',
                presentmentAmount: '0',
            })
        )

        const lineItem = (
            fromJS(
                shopifyLineItemFixture({
                    currencyCode: 'USD',
                    presentmentCurrencyCode: 'JPY',
                    presentmentPrice: '100',
                })
            ) as Map<any, any>
        ).set('total_discount_set', totalDiscountSet)

        const {container} = render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={0}
                isRestockable
                shopName="storegorgias3"
                currencyCode="JPY"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with discounted price', () => {
        const totalDiscountSet = fromJS(
            shopifyPriceSetFixture({amount: '0.50'})
        )
        const lineItem = (
            fromJS(shopifyLineItemFixture({currencyCode: 'USD'})) as Map<
                any,
                any
            >
        ).set('total_discount_set', totalDiscountSet)

        const {container} = render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={0}
                isRestockable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without quantity and without price', () => {
        const order = fromJS(shopifyOrderFixture())
        const lineItems = initRefundOrderLineItems(order)
        const lineItem = (lineItems.get(0) as Map<any, any>).set('quantity', 0)

        const {container} = render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={0}
                isRestockable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with "not restockable" message', () => {
        const totalDiscountSet = fromJS(
            shopifyPriceSetFixture({amount: '0.00'})
        )
        const lineItem = (
            fromJS(shopifyLineItemFixture({currencyCode: 'USD'})) as Map<
                any,
                any
            >
        ).set('total_discount_set', totalDiscountSet)

        render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={0}
                isRestockable={false}
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )

        expect(screen.getByText("This product can't be restocked."))
    })

    describe('onQuantityChange()', () => {
        it('should call trigger onChange() with updated line item and index', () => {
            const lineItem = fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<string, any>
            const index = 3

            render(
                <OrderLineItemRow
                    lineItem={lineItem}
                    index={index}
                    isRestockable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            fireEvent.change(screen.getByRole('textbox'), {
                target: {value: '0'},
            })
            jest.advanceTimersByTime(300)
            expect(onChange).toHaveBeenCalledWith(
                lineItem.set('quantity', 0),
                index
            )
        })

        it('should use minimum value if the input is empty', () => {
            const lineItem = fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<string, any>
            const index = 0

            render(
                <OrderLineItemRow
                    lineItem={lineItem}
                    index={index}
                    isRestockable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            fireEvent.change(screen.getByRole('textbox'), {
                target: {value: ''},
            })
            jest.advanceTimersByTime(300)
            expect(onChange).toHaveBeenCalledWith(
                lineItem.set('quantity', 0),
                index
            )
        })

        it('should not call onChange if the value is too big and quantity is already maxed', () => {
            const lineItem = fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<string, any>

            const index = 0

            render(
                <OrderLineItemRow
                    lineItem={lineItem}
                    index={index}
                    isRestockable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            fireEvent.change(screen.getByRole('textbox'), {
                target: {value: '4'},
            })
            jest.advanceTimersByTime(300)
            expect(onChange).not.toBeCalled()
        })
    })

    it('should not call onChange() when incrementing quantity already maxed', () => {
        const lineItem = fromJS(
            shopifyLineItemFixture({currencyCode: 'USD'})
        ) as Map<string, any>
        const index = 0

        render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={index}
                isRestockable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )
        fireEvent.click(screen.getByText('▲'))
        jest.advanceTimersByTime(300)
        expect(onChange).not.toBeCalled()
    })

    it('should call onChange() when incrementing quantity', () => {
        const lineItem = fromJS(
            shopifyLineItemFixture({currencyCode: 'USD', quantity: 5})
        ) as Map<string, any>
        const index = 0

        render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={index}
                isRestockable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: '2'},
        })
        jest.advanceTimersByTime(300)
        fireEvent.click(screen.getByText('▲'))
        jest.advanceTimersByTime(300)
        expect(onChange).toHaveBeenCalledWith(
            lineItem.set('quantity', 3),
            index
        )
    })

    it('should call onChange() when decrementing quantity', () => {
        const lineItem = fromJS(
            shopifyLineItemFixture({currencyCode: 'USD'})
        ) as Map<string, any>
        const index = 0

        render(
            <OrderLineItemRow
                lineItem={lineItem}
                index={index}
                isRestockable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                onChange={onChange}
            />
        )
        fireEvent.click(screen.getByText('▼'))
        jest.advanceTimersByTime(300)
        expect(onChange).toHaveBeenCalledWith(
            lineItem.set('quantity', 0),
            index
        )
    })
})
