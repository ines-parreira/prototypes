import {shallow} from 'enzyme'
import React from 'react'
import {fromJS, Map} from 'immutable'

import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyPriceSetFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import {initRefundOrderLineItems} from '../../../../../../../../../../../../../business/shopify/order'
import {OrderLineItemRow} from '../OrderLineItemRow'

jest.mock('lodash/debounce', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(v: T) => T = jest.requireActual('lodash/identity')
    return _identity
})

describe('<LineItemRow/>', () => {
    let onChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
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

            const lineItem = (fromJS(
                shopifyLineItemFixture({
                    currencyCode: 'USD',
                    presentmentCurrencyCode: 'JPY',
                    presentmentPrice: '100',
                })
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)

            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="JPY"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with discounted price', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.50'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const order = fromJS(shopifyOrderFixture())
            const lineItems = initRefundOrderLineItems(order)
            const lineItem = (lineItems.get(0) as Map<any, any>).set(
                'quantity',
                0
            )
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with "not restockable" message', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            component.setState({restockable: false})

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onQuantityChange()', () => {
        it('should call onChange() with updated line item', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            component
                .find({type: 'text'})
                .simulate('change', {target: {value: '0'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 0))
        })

        it('should use minimum value if the input is empty', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            component
                .find({type: 'text'})
                .simulate('change', {target: {value: ''}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 0))
        })

        it('should use maximum value if the value is too big', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            component
                .find({type: 'text'})
                .simulate('change', {target: {value: '2'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 1))
        })
    })

    describe('_onQuantityUp()', () => {
        it('should call onChange() with incremented quantity', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD', quantity: 0})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            ;(component.instance() as InstanceType<
                typeof OrderLineItemRow
            >)._onQuantityUp()

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 1))
        })

        it('should call onChange() with decremented quantity', () => {
            const totalDiscountSet = fromJS(
                shopifyPriceSetFixture({amount: '0.00'})
            )
            const lineItem = (fromJS(
                shopifyLineItemFixture({currencyCode: 'USD'})
            ) as Map<any, any>).set('total_discount_set', totalDiscountSet)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    onChange={onChange}
                />
            )

            ;(component.instance() as InstanceType<
                typeof OrderLineItemRow
            >)._onQuantityDown()

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 0))
        })
    })
})
