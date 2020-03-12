// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {Button, Form, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import AddCustomItemPopover from '../AddCustomItemPopover'

describe('<AddCustomItemPopover/>', () => {
    let onSubmit

    beforeEach(() => {
        onSubmit = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <AddCustomItemPopover
                    currencyCode="USD"
                    id="add-custom-line-popover"
                    onSubmit={onSubmit}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it('should call prop `onSubmit` with form values', () => {
            const component = shallow(
                <AddCustomItemPopover
                    currencyCode="USD"
                    id="add-custom-line-popover"
                    onSubmit={onSubmit}
                />
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component.find({id: 'title'}).simulate('change', {target: {value: 'foo'}})
            component.instance()._onPriceChange('5.99')
            component.find({id: 'quantity'}).simulate('change', {target: {value: '2'}})
            component.find({type: 'checkbox'}).at(0).simulate('change', {target: {checked: true}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onSubmit).toHaveBeenCalledWith(fromJS({
                title: 'foo',
                price: '5.99',
                quantity: 2,
                taxable: true,
                requires_shipping: false,
                product_exists: false,
            }))
        })
    })
})
