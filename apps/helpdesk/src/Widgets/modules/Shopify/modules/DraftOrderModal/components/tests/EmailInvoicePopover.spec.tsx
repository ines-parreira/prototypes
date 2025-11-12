import React, { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import EmailInvoicePopover from 'Widgets/modules/Shopify/modules/DraftOrderModal/components/EmailInvoicePopover'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

jest.mock('@repo/logging', () => {
    const SegmentTracker = jest.requireActual('@repo/logging')
    return {
        ...SegmentTracker,
        logEvent: jest.fn(),
    } as Record<string, unknown>
})

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
            const buttonText = 'Email invoice'
            const { getByRole } = render(
                <EmailInvoicePopover
                    id="email-invoice"
                    actionName={ShopifyActionType.DuplicateOrder}
                    color="primary"
                    customerEmail={customerEmail}
                    disabled={false}
                    onSubmit={onSubmit}
                >
                    {buttonText}
                </EmailInvoicePopover>,
            )

            expect(
                getByRole('button', { name: buttonText }),
            ).toBeInTheDocument()
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
                render(
                    <EmailInvoicePopover
                        id="email-invoice"
                        actionName={actionName}
                        color="primary"
                        customerEmail={customerEmail}
                        disabled={false}
                        onSubmit={onSubmit}
                    >
                        Email invoice
                    </EmailInvoicePopover>,
                )

                // Open popover
                userEvent.click(screen.getByRole('button'))
                expect(logEvent).toHaveBeenCalledWith(openEvent)
                // Change form values
                const emailField = screen.getByLabelText('Email address')
                userEvent.clear(emailField)
                userEvent.paste(emailField, 'abc@foo.xyz')
                const messageField = screen.getByLabelText('Custom message')
                userEvent.clear(messageField)
                userEvent.paste(messageField, 'foo bar')
                // Submit
                userEvent.click(
                    screen.getByRole('button', { name: 'Create Draft Order' }),
                )

                expect(onSubmit).toHaveBeenCalledWith(
                    fromJS({
                        to: 'abc@foo.xyz',
                        custom_message: 'foo bar',
                    }),
                )
                expect(logEvent).toHaveBeenCalledWith(submitEvent)
            },
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
            render(
                <EmailInvoicePopover
                    id="email-invoice"
                    actionName={actionName}
                    color="primary"
                    customerEmail={customerEmail}
                    disabled={false}
                    onSubmit={onSubmit}
                >
                    Email invoice
                </EmailInvoicePopover>,
            )

            // Open popover
            userEvent.click(screen.getByRole('button'))
            userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
