// @flow

import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {Button, Form, Popover} from 'reactstrap'

import TaxesPopover from '../TaxesPopover'

describe('<TaxesPopover/>', () => {
    let onChange

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render with checked checkbox because we charge taxes', () => {
            const taxExempt = false

            const component = shallow(
                <TaxesPopover
                    id="taxes"
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    Taxes
                </TaxesPopover>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with unchecked checkbox because we do not charge taxes', () => {
            const taxExempt = true

            const component = shallow(
                <TaxesPopover
                    id="taxes"
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    Taxes
                </TaxesPopover>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it('should call onChange() with update value', () => {
            const taxExempt = false

            const component = shallow(
                <TaxesPopover
                    id="taxes"
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    Taxes
                </TaxesPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component.find({type: 'checkbox'}).dive().find('input').simulate('change', {target: {checked: false}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(!taxExempt)
        })
    })
})
