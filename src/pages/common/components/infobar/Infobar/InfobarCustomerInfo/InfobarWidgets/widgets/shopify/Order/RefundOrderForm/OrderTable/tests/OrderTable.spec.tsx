import React from 'react'
import {fromJS, List, Map} from 'immutable'
import {fireEvent, render, screen} from '@testing-library/react'

import {FulfillmentStatus} from 'constants/integrations/types/shopify'
import {
    shopifyOrderFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import OrderTable from '../OrderTable'

describe('<OrderTable/>', () => {
    let onLineItemChange: jest.MockedFunction<any>

    const lineItems = (fromJS(shopifyOrderFixture()) as Map<any, any>).get(
        'line_items'
    ) as List<Map<string, any>>
    const refund = fromJS(shopifySuggestedRefundFixture()) as Map<any, any>

    beforeEach(() => {
        jest.useFakeTimers()
        onLineItemChange = jest.fn()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render', () => {
        const {container} = render(
            <OrderTable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                lineItems={lineItems}
                refund={refund}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={FulfillmentStatus.Partial}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.getByLabelText('Quantity warning'))
    })

    it('should render without warning icon', () => {
        render(
            <OrderTable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                lineItems={lineItems}
                refund={refund}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={FulfillmentStatus.Fulfilled}
            />
        )

        expect(screen.queryByAltText('Quantity warning')).toBeNull()
    })

    it('should render for multi-currency order', () => {
        const {container} = render(
            <OrderTable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="JPY"
                lineItems={lineItems}
                refund={refund}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={FulfillmentStatus.Partial}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a non restockable item', () => {
        render(
            <OrderTable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="JPY"
                lineItems={lineItems}
                refund={refund
                    .setIn(
                        ['refund_line_items', 0, 'line_item_id'],
                        lineItems.getIn([0, 'id'])
                    )
                    .setIn(['refund_line_items', 0, 'location_id'], null)}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={FulfillmentStatus.Partial}
            />
        )
        expect(screen.getByText("This product can't be restocked."))
    })

    it('should call onLineItemChange() with updated payload', () => {
        render(
            <OrderTable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                lineItems={lineItems}
                refund={refund}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={FulfillmentStatus.Partial}
            />
        )
        fireEvent.change(screen.getAllByRole('textbox')[0], {
            target: {value: '0'},
        })
        jest.advanceTimersByTime(300)
        expect(onLineItemChange).toHaveBeenCalledWith(
            lineItems.get(0).set('quantity', 0),
            0
        )
    })
    it('should keep the initial maximum quantity', () => {
        render(
            <OrderTable
                shopName="storegorgias3"
                currencyCode="USD"
                shopCurrencyCode="USD"
                lineItems={lineItems.setIn([0, 'quantity'], 3)}
                refund={refund}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={FulfillmentStatus.Partial}
            />
        )
        fireEvent.click(screen.getAllByText('▼')[0])
        fireEvent.click(screen.getAllByText('▼')[0])
        jest.advanceTimersByTime(300)
        fireEvent.click(screen.getAllByText('▲')[0])
        jest.advanceTimersByTime(300)
        expect(onLineItemChange).toHaveBeenLastCalledWith(
            lineItems.get(0).set('quantity', 2),
            0
        )
    })
})
