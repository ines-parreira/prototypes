// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {Button, Form, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import EmailInvoicePopover from '../EmailInvoicePopover'

describe('<EmailInvoicePopover/>', () => {
    const customerEmail = 'foo@bar.xyz'
    let onSubmit

    beforeEach(() => {
        onSubmit = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <EmailInvoicePopover
                    id="email-invoice"
                    color="primary"
                    customerEmail={customerEmail}
                    disabled={false}
                    onSubmit={onSubmit}
                >
                    Email invoice
                </EmailInvoicePopover>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it('should call prop `onSubmit` with form values', () => {
            const component = shallow(
                <EmailInvoicePopover
                    id="email-invoice"
                    color="primary"
                    customerEmail={customerEmail}
                    disabled={false}
                    onSubmit={onSubmit}
                >
                    Email invoice
                </EmailInvoicePopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component.find({id: 'to'}).simulate('change', {target: {value: 'abc@foo.xyz'}})
            component.find({id: 'custom-message'}).simulate('change', {target: {value: 'foo bar'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onSubmit).toHaveBeenCalledWith(fromJS({
                to: 'abc@foo.xyz',
                custom_message: 'foo bar',
            }))
        })
    })
})
