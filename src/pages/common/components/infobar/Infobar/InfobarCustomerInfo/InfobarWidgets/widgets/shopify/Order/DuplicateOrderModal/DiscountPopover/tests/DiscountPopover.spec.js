// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {Button, Form, InputGroupAddon, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import * as Shopify from '../../../../../../../../../../../../../constants/integrations/shopify'
import DiscountPopover from '../DiscountPopover'

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
        it('should call prop `onChange` with fixed amount discount', () => {
            const component = shallow(
                <DiscountPopover
                    label="order"
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
        })

        it('should call prop `onChange` with percentage amount discount', () => {
            const component = shallow(
                <DiscountPopover
                    label="order"
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
        it('should call prop `onChange` with `null`', () => {
            const appliedDiscount: Shopify.AppliedDiscount = {
                title: 'foo',
                value: '5.99',
                value_type: 'fixed_amount',
                amount: '5.99',
            }

            const component = shallow(
                <DiscountPopover
                    label="order"
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
        })
    })
})
