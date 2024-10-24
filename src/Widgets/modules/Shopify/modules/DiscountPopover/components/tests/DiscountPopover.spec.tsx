import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import * as reactstrap from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import {
    AppliedDiscount,
    DiscountType,
} from 'constants/integrations/types/shopify'

import DiscountPopover from 'Widgets/modules/Shopify/modules/DiscountPopover/components/DiscountPopover'
import {ShopifyActionType} from 'Widgets/modules/Shopify/types'

jest.mock('common/segment', () => {
    const segmentTracker: Record<string, unknown> =
        jest.requireActual('common/segment')

    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

describe('<DiscountPopover/>', () => {
    const buttonText = 'Add discount'
    let onChange: jest.MockedFunction<any>
    let popoverSpy: jest.MockedFunction<any>
    beforeEach(() => {
        onChange = jest.fn()
        popoverSpy = jest
            .spyOn(reactstrap, 'Popover')
            .mockImplementation(({children}): any => <div>{children}</div>)
    })

    describe('render()', () => {
        it('should render without value', () => {
            const {container} = render(
                <DiscountPopover
                    label="order"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    max={10}
                    value={null}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    {buttonText}
                </DiscountPopover>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with value', () => {
            const appliedDiscount: AppliedDiscount = {
                title: 'foo',
                value: '5.99',
                value_type: DiscountType.FixedAmount,
                amount: '5.99',
            }

            const {container} = render(
                <DiscountPopover
                    label="order"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    max={10}
                    value={fromJS(appliedDiscount)}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    {buttonText}
                </DiscountPopover>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderDiscountPopoverOpen,
                SegmentEvent.ShopifyCreateOrderDiscountPopoverApply,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderDiscountPopoverOpen,
                SegmentEvent.ShopifyDuplicateOrderDiscountPopoverApply,
            ],
            [
                ShopifyActionType.EditOrder,
                SegmentEvent.ShopifyEditOrderDiscountPopoverOpen,
                SegmentEvent.ShopifyEditOrderDiscountPopoverApply,
            ],
        ])(
            'should call prop `onChange` with fixed amount discount',
            (actionName, openEvent, submitEvent) => {
                render(
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
                        {buttonText}
                    </DiscountPopover>
                )

                // Open popover
                userEvent.click(screen.getByText(buttonText))
                expect(logEvent).toHaveBeenCalledWith(openEvent)

                // Change form values
                fireEvent.change(screen.getByRole('spinbutton'), {
                    target: {value: 5.99},
                })

                userEvent.paste(screen.getByRole('textbox'), 'foo')
                userEvent.click(screen.getByText('Apply'))

                expect(onChange).toHaveBeenCalledWith(
                    fromJS({
                        title: 'foo',
                        value: '5.99',
                        value_type: 'fixed_amount',
                        amount: '5.99',
                        currency_code: 'USD',
                    })
                )

                expect(logEvent).toHaveBeenCalledWith(submitEvent)
            }
        )

        it('should call prop `onChange` with percentage amount discount', () => {
            render(
                <DiscountPopover
                    label="order"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    max={10}
                    value={null}
                    currencyCode="USD"
                    id="discount-popover"
                    onChange={onChange}
                >
                    {buttonText}
                </DiscountPopover>
            )

            // Open popover
            userEvent.click(screen.getByText(buttonText))

            // Change form values
            userEvent.click(screen.getByText('%'))
            fireEvent.change(screen.getByRole('spinbutton'), {
                target: {value: 15},
            })

            userEvent.paste(screen.getByRole('textbox'), 'bar')

            userEvent.click(screen.getByText('Apply'))

            expect(onChange).toHaveBeenCalledWith(
                fromJS({
                    title: 'bar',
                    value: '15.00',
                    value_type: 'percentage',
                    amount: '1.50',
                    currency_code: 'USD',
                })
            )
        })
    })

    describe('_onRemove', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderDiscountPopoverRemove,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderDiscountPopoverRemove,
            ],
        ])('should call prop `onChange` with `null`', (actionName, event) => {
            const appliedDiscount: AppliedDiscount = {
                title: 'foo',
                value: '5.99',
                value_type: DiscountType.FixedAmount,
                amount: '5.99',
            }

            render(
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
                    {buttonText}
                </DiscountPopover>
            )

            // Open popover
            userEvent.click(screen.getByText(buttonText))
            expect(popoverSpy).toHaveBeenCalledWith(
                expect.objectContaining({isOpen: true}),
                {}
            )

            // Click on "Remove"
            userEvent.click(screen.getByText('Remove'))

            expect(onChange).toHaveBeenCalledWith(null)
            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })

    describe('_onClose()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderDiscountPopoverClose,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderDiscountPopoverClose,
            ],
        ])('should track', (actionName, event) => {
            render(
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
                    {buttonText}
                </DiscountPopover>
            )

            userEvent.click(screen.getByText('Add discount'))
            userEvent.click(screen.getByText('Close'))

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
