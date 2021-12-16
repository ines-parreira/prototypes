import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {Button, Form, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {
    SegmentEvent,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import EmailInvoicePopover from '../EmailInvoicePopover'
import {ShopifyActionType} from '../../../../types'

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker',
    () => {
        const SegmentTracker = jest.requireActual(
            '../../../../../../../../../../../../../store/middlewares/segmentTracker'
        )
        return {
            ...SegmentTracker,
            logEvent: jest.fn(),
        } as Record<string, unknown>
    }
)

describe('<EmailInvoicePopover/>', () => {
    const customerEmail = 'foo@bar.xyz'
    let onSubmit: jest.MockedFunction<
        ComponentProps<typeof EmailInvoicePopover>['onSubmit']
    >

    beforeEach(() => {
        onSubmit = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <EmailInvoicePopover
                    id="email-invoice"
                    actionName={ShopifyActionType.DuplicateOrder}
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
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderEmailInvoicePopoverOpen,
                SegmentEvent.ShopifyCreateOrderEmailInvoicePopoverSend,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderEmailInvoicePopoverOpen,
                SegmentEvent.ShopifyDuplicateOrderEmailInvoicePopoverSend,
            ],
        ])(
            'should call prop `onSubmit` with form values',
            (actionName, openEvent, submitEvent) => {
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
                component
                    .find({id: 'to'})
                    .simulate('change', {target: {value: 'abc@foo.xyz'}})
                component
                    .find({id: 'custom-message'})
                    .simulate('change', {target: {value: 'foo bar'}})

                // Submit
                component
                    .find(Form)
                    .dive()
                    .find('form')
                    .simulate('submit', {preventDefault: _noop})

                expect(onSubmit).toHaveBeenCalledWith(
                    fromJS({
                        to: 'abc@foo.xyz',
                        custom_message: 'foo bar',
                    })
                )

                expect(logEvent).toHaveBeenCalledWith(submitEvent)
            }
        )
    })

    describe('_onCancel()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderEmailInvoicePopoverCancel,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderEmailInvoicePopoverCancel,
            ],
        ])('should track', (actionName, event) => {
            const component = shallow<EmailInvoicePopover>(
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
