import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../../fixtures/shopify'
import OrderTotals from '../OrderTotals'

jest.mock('lodash/debounce', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(v: T) => T = jest.requireActual('lodash/identity')
    return _identity
})

describe('<OrderTotals/>', () => {
    let payload: Map<any, any>
    let refund: Map<any, any>
    let onPayloadChange: jest.MockedFunction<any>

    beforeEach(() => {
        onPayloadChange = jest.fn()

        payload = fromJS(shopifyRefundOrderPayloadFixture())
        refund = fromJS(shopifySuggestedRefundFixture())
    })

    describe('render()', () => {
        it('should render as loading', () => {
            const component = shallow(
                <OrderTotals
                    editable
                    hasShippingLine={false}
                    currencyCode="USD"
                    loading
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as not loading', () => {
            const component = shallow(
                <OrderTotals
                    editable
                    hasShippingLine={false}
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with shipping line', () => {
            payload = payload.setIn(['shipping', 'amount'], '9.99')
            refund = refund
                .setIn(['shipping', 'amount'], '9.99')
                .setIn(['shipping', 'maximum_refundable'], '9.99')

            const component = shallow(
                <OrderTotals
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onShippingChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            payload = payload.setIn(['shipping', 'amount'], '9.99')
            refund = refund
                .setIn(['shipping', 'amount'], '9.99')
                .setIn(['shipping', 'maximum_refundable'], '9.99')

            const component = shallow(
                <OrderTotals
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />
            )

            ;(component.instance() as InstanceType<
                typeof OrderTotals
            >)._onShippingChange('9.00')

            const newPayload = payload.setIn(['shipping', 'amount'], '9.00')
            expect(onPayloadChange).toHaveBeenCalledWith(newPayload)
        })

        it('should not call onPayloadChange() because the shipping amount is the same', () => {
            payload = payload.setIn(['shipping', 'amount'], '9.00')
            refund = refund
                .setIn(['shipping', 'amount'], '9.00')
                .setIn(['shipping', 'maximum_refundable'], '9.00')

            const component = shallow(
                <OrderTotals
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={refund}
                    onPayloadChange={onPayloadChange}
                />
            )

            ;(component.instance() as InstanceType<
                typeof OrderTotals
            >)._onShippingChange('9')

            expect(onPayloadChange).not.toHaveBeenCalled()
        })
    })
})
