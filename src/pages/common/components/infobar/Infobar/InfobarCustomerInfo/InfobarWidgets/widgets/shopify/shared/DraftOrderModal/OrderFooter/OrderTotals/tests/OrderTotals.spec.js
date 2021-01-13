// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    shopifyCalculatedDraftOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyShippingLineFixture,
} from '../../../../../../../../../../../../../../fixtures/shopify.ts'
import {OrderTotalsComponent} from '../OrderTotals'
import {ShopifyAction} from '../../../../../constants'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<OrderTotalsComponent/>', () => {
    const context = {integrationId: 1}
    const payload = fromJS(shopifyDraftOrderPayloadFixture())
    const calculatedDraftOrder = fromJS(shopifyCalculatedDraftOrderFixture())
    let onPayloadChange

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render as loading', () => {
            const component = shallow(
                <OrderTotalsComponent
                    editable
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    currencyCode="USD"
                    loading
                    payload={payload}
                    calculatedDraftOrder={calculatedDraftOrder}
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
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    calculatedDraftOrder={calculatedDraftOrder}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with taxes included', () => {
            const taxesIncludedDraftOrder = calculatedDraftOrder.set(
                'totalPrice',
                '9.99'
            )

            const component = shallow(
                <OrderTotalsComponent
                    editable
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    currencyCode="USD"
                    loading
                    payload={payload}
                    calculatedDraftOrder={taxesIncludedDraftOrder}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onDiscountCodesChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const component = shallow(
                <OrderTotalsComponent
                    editable
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    calculatedDraftOrder={calculatedDraftOrder}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            component.instance()._onAppliedDiscountChange(null)

            const newPayload = payload.set('applied_discount', null)
            expect(onPayloadChange).toHaveBeenCalledWith(
                context.integrationId,
                newPayload
            )
        })
    })

    describe('_onShippingLineChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const component = shallow(
                <OrderTotalsComponent
                    editable
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    calculatedDraftOrder={calculatedDraftOrder}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            const shippingLine = fromJS(shopifyShippingLineFixture())
            component.instance()._onShippingLineChange(shippingLine)

            const newPayload = payload.set('shipping_line', shippingLine)
            expect(onPayloadChange).toHaveBeenCalledWith(
                context.integrationId,
                newPayload
            )
        })
    })

    describe('_onTaxExemptChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const component = shallow(
                <OrderTotalsComponent
                    editable
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    calculatedDraftOrder={calculatedDraftOrder}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            component.instance()._onTaxExemptChange(true)

            const newPayload = payload.set('tax_exempt', true)
            expect(onPayloadChange).toHaveBeenCalledWith(
                context.integrationId,
                newPayload
            )
        })
    })
})
