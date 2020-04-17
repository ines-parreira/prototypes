// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {Button, Form, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {EVENTS, logEvent} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import EmailInvoicePopover from '../EmailInvoicePopover'
import {ShopifyAction} from '../../../../constants'

jest.mock('../../../../../../../../../../../../../store/middlewares/segmentTracker', () => {
    return {
        ...jest.requireActual('../../../../../../../../../../../../../store/middlewares/segmentTracker'),
        logEvent: jest.fn(),
    }
})

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
                    actionName={ShopifyAction.DUPLICATE_ORDER}
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
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_OPEN,
                EVENTS.SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_SEND,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_OPEN,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_SEND,
            ],
        ])('should call prop `onSubmit` with form values', (actionName, openEvent, submitEvent) => {
            const component = shallow(
                <EmailInvoicePopover
                    id="email-invoice"
                    actionName={actionName}
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
            expect(logEvent).toHaveBeenCalledWith(openEvent)

            // Change form values
            component.find({id: 'to'}).simulate('change', {target: {value: 'abc@foo.xyz'}})
            component.find({id: 'custom-message'}).simulate('change', {target: {value: 'foo bar'}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onSubmit).toHaveBeenCalledWith(fromJS({
                to: 'abc@foo.xyz',
                custom_message: 'foo bar',
            }))

            expect(logEvent).toHaveBeenCalledWith(submitEvent)
        })
    })

    describe('_onCancel()', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_CANCEL],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_CANCEL],
        ])('should track', (actionName, event) => {
            const component = shallow(
                <EmailInvoicePopover
                    id="email-invoice"
                    actionName={actionName}
                    color="primary"
                    customerEmail={customerEmail}
                    disabled={false}
                    onSubmit={onSubmit}
                >
                    Email invoice
                </EmailInvoicePopover>
            )

            component.instance()._onCancel()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
