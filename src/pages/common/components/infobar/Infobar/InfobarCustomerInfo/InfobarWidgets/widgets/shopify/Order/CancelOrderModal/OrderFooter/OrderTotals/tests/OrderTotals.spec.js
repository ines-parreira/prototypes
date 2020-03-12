// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    shopifyCancelOrderPayloadFixture,
    shopifySuggestedRefundFixture
} from '../../../../../../../../../../../../../../fixtures/shopify'
import {OrderTotalsComponent} from '../OrderTotals'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<OrderTotalsComponent/>', () => {
    const context = {integrationId: 1}

    let payload = fromJS(shopifyCancelOrderPayloadFixture())
    let refund = fromJS(shopifySuggestedRefundFixture())
    let onPayloadChange

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render as loading', () => {
            const component = shallow(
                <OrderTotalsComponent
                    editable
                    hasShippingLine={false}
                    currencyCode="USD"
                    loading
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as not loading', () => {
            const component = shallow(
                <OrderTotalsComponent
                    editable
                    hasShippingLine={false}
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with shipping line', () => {
            payload = payload.setIn(['refund', 'shipping', 'amount'], '9.99')
            refund = refund
                .setIn(['shipping', 'amount'], '9.99')
                .setIn(['shipping', 'maximum_refundable'], '9.99')

            const component = shallow(
                <OrderTotalsComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onShippingChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            payload = payload.setIn(['refund', 'shipping', 'amount'], '9.99')
            refund = refund
                .setIn(['shipping', 'amount'], '9.99')
                .setIn(['shipping', 'maximum_refundable'], '9.99')

            const component = shallow(
                <OrderTotalsComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            component.instance()._onShippingChange('9.00')

            const newPayload = payload.setIn(['refund', 'shipping', 'amount'], '9.00')
            expect(onPayloadChange).toHaveBeenCalledWith(context.integrationId, newPayload)
        })
    })
})
