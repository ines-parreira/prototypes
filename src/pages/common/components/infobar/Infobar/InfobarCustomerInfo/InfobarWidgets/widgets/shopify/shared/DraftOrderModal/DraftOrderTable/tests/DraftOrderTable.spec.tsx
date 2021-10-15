import React from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyProductFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import DraftOrderTable from '../DraftOrderTable'
import {ShopifyActionType} from '../../../../types'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)
jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker'
)

describe('<DraftOrderTable/>', () => {
    let handleLineItemUpdate: jest.MockedFunction<any>
    let handleLineItemDelete: jest.MockedFunction<any>

    const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>)
        .setIn(['line_items', 0, 'product_id'], 1)
        .setIn(['line_items', 1, 'product_id'], 2)

    const product1 = shopifyProductFixture({id: 1, title: 'Product 1'})
    const product2 = shopifyProductFixture({id: 2, title: 'Product 2'})

    const products = new window.Map([
        [1, fromJS(product1)],
        [2, fromJS(product2)],
    ])

    beforeEach(() => {
        jest.useFakeTimers()
        handleLineItemUpdate = jest.fn()
        handleLineItemDelete = jest.fn()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render', () => {
        const {container} = render(
            <DraftOrderTable
                shopName="storegorgias3"
                isShownInEditOrder={false}
                actionName={ShopifyActionType.DuplicateOrder}
                currencyCode="USD"
                lineItems={payload.get('line_items', [])}
                products={products}
                onLineItemUpdate={handleLineItemUpdate}
                onLineItemDelete={handleLineItemDelete}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without products', () => {
        const {container} = render(
            <DraftOrderTable
                shopName="storegorgias3"
                isShownInEditOrder={false}
                actionName={ShopifyActionType.DuplicateOrder}
                currencyCode="USD"
                lineItems={payload.get('line_items', [])}
                products={fromJS({})}
                onLineItemUpdate={handleLineItemUpdate}
                onLineItemDelete={handleLineItemDelete}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without line items', () => {
        const {container} = render(
            <DraftOrderTable
                shopName="storegorgias3"
                isShownInEditOrder={false}
                actionName={ShopifyActionType.DuplicateOrder}
                currencyCode="USD"
                lineItems={fromJS([])}
                products={products}
                onLineItemUpdate={handleLineItemUpdate}
                onLineItemDelete={handleLineItemDelete}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onLineItemUpdate() with updated data when updating', () => {
        render(
            <DraftOrderTable
                shopName="storegorgias3"
                isShownInEditOrder={false}
                actionName={ShopifyActionType.DuplicateOrder}
                currencyCode="USD"
                lineItems={payload.get('line_items', [])}
                products={products}
                onLineItemUpdate={handleLineItemUpdate}
                onLineItemDelete={handleLineItemDelete}
            />
        )
        fireEvent.change(screen.getAllByRole('spinbutton')[0], {
            target: {value: 2},
        })

        jest.advanceTimersByTime(1000)
        let newLineItem = payload.getIn(['line_items', 0]) as Map<any, any>
        newLineItem = newLineItem.set('quantity', 2)
        expect(handleLineItemUpdate).toHaveBeenCalledWith(newLineItem, 0)
    })

    it('should call onLineItemDelete() with correct data when deleting', () => {
        render(
            <DraftOrderTable
                shopName="storegorgias3"
                isShownInEditOrder={false}
                actionName={ShopifyActionType.DuplicateOrder}
                currencyCode="USD"
                lineItems={payload.get('line_items', [])}
                products={products}
                onLineItemUpdate={handleLineItemUpdate}
                onLineItemDelete={handleLineItemDelete}
            />
        )
        fireEvent.click(screen.getAllByText('close')[0])

        expect(handleLineItemDelete).toHaveBeenCalledWith(0)
    })
})
