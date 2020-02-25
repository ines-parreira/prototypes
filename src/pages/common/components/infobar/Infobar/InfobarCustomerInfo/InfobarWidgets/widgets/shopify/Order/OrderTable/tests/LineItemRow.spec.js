// @flow

import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import {shopifyDraftOrderPayloadFixture, shopifyProductFixture} from '../../../../../../../../../../../../fixtures/shopify'
import {LineItemRow} from '../LineItemRow'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<LineItemRow/>', () => {
    let onChange, onDelete

    beforeEach(() => {
        onChange = jest.fn()
        onDelete = jest.fn()
    })

    describe('render()', () => {
        it('should render without product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <LineItemRow
                    lineItem={lineItem}
                    product={null}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    editable
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <LineItemRow
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    editable
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onQuantityChange()', () => {
        it('should call onChange() with updated line item', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <LineItemRow
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    editable
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            component.find({type: 'number'}).simulate('change', {target: {value: '5'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 5))
        })
    })
})
