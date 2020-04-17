// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {Button, Form, InputGroupAddon, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {EVENTS, logEvent} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import * as Shopify from '../../../../../../../../../../../../../constants/integrations/shopify'
import DiscountPopover from '../DiscountPopover'
import {ShopifyAction} from '../../../../constants'

jest.mock('../../../../../../../../../../../../../store/middlewares/segmentTracker', () => {
    return {
        ...jest.requireActual('../../../../../../../../../../../../../store/middlewares/segmentTracker'),
        logEvent: jest.fn(),
    }
})

describe('<DiscountPopover/>', () => {
    let onChange

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render without value', () => {
            const component = shallow(
                <DiscountPopover
                    label="order"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    max={10}
                    value={null}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    Add discount
                </DiscountPopover>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with value', () => {
            const appliedDiscount: Shopify.AppliedDiscount = {
                title: 'foo',
                value: '5.99',
                value_type: 'fixed_amount',
                amount: '5.99',
            }

            const component = shallow(
                <DiscountPopover
                    label="order"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    max={10}
                    value={fromJS(appliedDiscount)}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    Add discount
                </DiscountPopover>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_OPEN,
                EVENTS.SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_APPLY,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_OPEN,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_APPLY,
            ],
        ])('should call prop `onChange` with fixed amount discount', (actionName, openEvent, submitEvent) => {
            const component = shallow(
                <DiscountPopover
                    label="order"
                    actionName={actionName}
                    editable
                    max={10}
                    value={null}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    Add discount
                </DiscountPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)
            expect(logEvent).toHaveBeenCalledWith(openEvent)

            // Change form values
            component.instance()._onDiscountValueChange('5.99')
            component.find({id: 'title'}).simulate('change', {target: {value: 'foo'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(fromJS({
                title: 'foo',
                value: '5.99',
                value_type: 'fixed_amount',
                amount: '5.99',
            }))

            expect(logEvent).toHaveBeenCalledWith(submitEvent)
        })

        it('should call prop `onChange` with percentage amount discount', () => {
            const component = shallow(
                <DiscountPopover
                    label="order"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    editable
                    max={10}
                    value={null}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    Add discount
                </DiscountPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component.find(InputGroupAddon).at(1).find(Button).simulate('click', {preventDefault: _noop})
            component.instance()._onDiscountValueChange('15')
            component.find({id: 'title'}).simulate('change', {target: {value: 'bar'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(fromJS({
                title: 'bar',
                value: '15.00',
                value_type: 'percentage',
                amount: '1.50',
            }))
        })
    })

    describe('_onRemove', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_REMOVE],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_REMOVE],
        ])('should call prop `onChange` with `null`', (actionName, event) => {
            const appliedDiscount: Shopify.AppliedDiscount = {
                title: 'foo',
                value: '5.99',
                value_type: 'fixed_amount',
                amount: '5.99',
            }

            const component = shallow(
                <DiscountPopover
                    label="order"
                    actionName={actionName}
                    editable
                    max={10}
                    value={fromJS(appliedDiscount)}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    Add discount
                </DiscountPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Click on "Remove"
            component.find(Button).at(3).simulate('click')

            expect(component.find(Popover).props().isOpen).toBe(false)
            expect(onChange).toHaveBeenCalledWith(null)
            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })

    describe('_onClose()', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_CLOSE],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_CLOSE],
        ])('should track', (actionName, event) => {
            const component = shallow(
                <DiscountPopover
                    label="order"
                    actionName={actionName}
                    editable
                    max={10}
                    value={null}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    Add discount
                </DiscountPopover>
            )

            component.instance()._onClose()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
