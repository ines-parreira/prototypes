// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import {Button, Form, Popover} from 'reactstrap'

import {EVENTS, logEvent} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import {shopifyShippingLineFixture} from '../../../../../../../../../../../../../fixtures/shopify'
import AmountInput from '../../../AmountInput'
import ShippingPopover from '../ShippingPopover'
import {ShopifyAction} from '../../../../constants'

jest.mock('../../../../../../../../../../../../../store/middlewares/segmentTracker', () => {
    return {
        ...jest.requireActual('../../../../../../../../../../../../../store/middlewares/segmentTracker'),
        logEvent: jest.fn(),
    }
})

describe('<ShippingPopover/>', () => {
    let onChange

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render without value', () => {
            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    currencyCode="USD"
                    value={null}
                    defaultValue={null}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with value', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    defaultValue={null}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with default value', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    currencyCode="USD"
                    value={null}
                    defaultValue={shippingLine}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_OPEN,
                EVENTS.SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_APPLY,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_OPEN,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_APPLY,
            ],
        ])('should call onChange() with custom shipping line', (actionName, openEvent, submitEvent) => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={actionName}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    defaultValue={null}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)
            expect(logEvent).toHaveBeenCalledWith(openEvent)

            // Change form values
            const type = 'custom'
            component.find({value: type}).simulate('change', {target: {value: type}})
            component.find({type: 'text'}).simulate('change', {target: {value: 'Test'}})
            component.find(AmountInput).dive().find({type: 'number'}).simulate('change', {target: {value: '12'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(fromJS({
                code: 'custom',
                price: '12.00',
                title: 'Test',
            }))

            expect(logEvent).toHaveBeenCalledWith(submitEvent, {type})
        })

        it('should call onChange() with free shipping line', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    defaultValue={null}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component.find({value: 'free'}).simulate('change', {target: {value: 'free'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(fromJS({
                code: 'custom',
                price: '0.00',
                title: 'Free shipping',
            }))
        })

        it('should call onChange() with original shipping line', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    currencyCode="USD"
                    value={null}
                    defaultValue={shippingLine}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component.find({value: 'original'}).simulate('change', {target: {value: 'original'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(shippingLine)
        })
    })

    describe('_onRemove', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_REMOVE],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_REMOVE],
        ])('should call onChange() with no shipping line', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    defaultValue={null}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Click on "Remove"
            component.find(Button).at(1).simulate('click')

            expect(component.find(Popover).props().isOpen).toBe(false)
            expect(onChange).toHaveBeenCalledWith(null)
        })
    })

    describe('_onClose()', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_CLOSE],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_CLOSE],
        ])('should track', (actionName, event) => {
            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={actionName}
                    editable
                    currencyCode="USD"
                    value={null}
                    defaultValue={null}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            component.instance()._onClose()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
