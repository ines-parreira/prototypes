import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'

import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import {
    shopifyAvailableShippingRate,
    shopifyShippingLineFixture,
} from 'fixtures/shopify'
import {ShopifyActionType} from '../../../../types'
import ShippingPopover from '../ShippingPopover'

jest.mock('store/middlewares/segmentTracker', () => {
    const segmentTracker: Record<string, unknown> = jest.requireActual(
        'store/middlewares/segmentTracker'
    )
    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

describe('<ShippingPopover/>', () => {
    let onChange: jest.MockedFunction<
        ComponentProps<typeof ShippingPopover>['onChange']
    >

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render without value', () => {
            const {baseElement} = render(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    currencyCode="USD"
                    value={null}
                    availableShippingRates={fromJS([])}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render with value', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const {baseElement} = render(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    availableShippingRates={fromJS([])}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            expect(baseElement).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderShippingPopoverOpen,
                SegmentEvent.ShopifyCreateOrderShippingPopoverApply,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderShippingPopoverOpen,
                SegmentEvent.ShopifyDuplicateOrderShippingPopoverApply,
            ],
        ])(
            'should call onChange() with custom shipping line for %s action',
            (actionName, openEvent, submitEvent) => {
                const shippingLine = fromJS(shopifyShippingLineFixture())
                const label = 'Add shipping'
                const {getByPlaceholderText, getByText} = render(
                    <ShippingPopover
                        id="shipping-lines"
                        actionName={actionName}
                        editable
                        currencyCode="USD"
                        value={shippingLine}
                        availableShippingRates={fromJS([])}
                        onChange={onChange}
                    >
                        {label}
                    </ShippingPopover>
                )

                // Open popover
                userEvent.click(getByText(label))
                const customInput = getByPlaceholderText('Custom rate name')
                expect(logEvent).toHaveBeenCalledWith(openEvent)
                // Change form values
                userEvent.click(getByText(/custom/i))
                fireEvent.change(customInput, {
                    target: {value: 'Test'},
                })
                fireEvent.change(document.getElementsByTagName('input')[1], {
                    target: {value: '12'},
                })
                // Submit
                userEvent.click(getByText('Apply'))

                expect(onChange).toHaveBeenCalledWith(
                    fromJS({
                        custom: true,
                        handle: null,
                        price: '12.00',
                        title: 'Test',
                    })
                )

                expect(logEvent).toHaveBeenCalledWith(submitEvent, {
                    handle: 'custom',
                })
            }
        )

        it('should call onChange() with free shipping line', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())
            const label = 'Add shipping'
            const {getByLabelText, getByText} = render(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    availableShippingRates={fromJS([])}
                    onChange={onChange}
                >
                    {label}
                </ShippingPopover>
            )

            userEvent.click(getByText(label))
            userEvent.click(getByLabelText(/free/i))
            userEvent.click(getByText('Apply'))

            expect(onChange).toHaveBeenCalledWith(
                fromJS({
                    custom: true,
                    handle: null,
                    price: '0.00',
                    title: 'Free shipping',
                })
            )
        })

        it('should call onChange() with available shipping line', () => {
            const availableShippingRate = fromJS(
                shopifyAvailableShippingRate()
            ) as Map<any, any>
            const label = 'Add shipping'
            const {getByLabelText, getByText} = render(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    currencyCode="USD"
                    value={null}
                    availableShippingRates={fromJS([availableShippingRate])}
                    onChange={onChange}
                >
                    {label}
                </ShippingPopover>
            )

            // Open popover
            userEvent.click(getByText(label))
            // Change form values
            userEvent.click(
                getByLabelText(
                    new RegExp(availableShippingRate.get('title'), 'i')
                )
            )
            // Submit
            userEvent.click(getByText('Apply'))

            expect(onChange).toHaveBeenCalledWith(
                fromJS({
                    custom: false,
                    handle: availableShippingRate.get('handle'),
                    price: null,
                    title: null,
                })
            )
        })
    })

    describe('_onRemove', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderShippingPopoverRemove,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderShippingPopoverRemove,
            ],
        ])('should call onChange() with no shipping line for %s action', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture()) as Map<
                any,
                any
            >
            const label = 'Add shipping'
            const {getByText} = render(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    currencyCode="USD"
                    value={shippingLine}
                    availableShippingRates={fromJS([])}
                    onChange={onChange}
                >
                    {label}
                </ShippingPopover>
            )

            userEvent.click(getByText(label))
            userEvent.click(getByText('Remove'))

            expect(onChange).toHaveBeenCalledWith(null)
        })
    })

    describe('_onClose()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderShippingPopoverClose,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderShippingPopoverClose,
            ],
        ])('should track %s', (actionName, event) => {
            const label = 'Add shipping'
            const {getByText} = render(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={actionName}
                    editable
                    currencyCode="USD"
                    value={null}
                    availableShippingRates={fromJS([])}
                    onChange={onChange}
                >
                    {label}
                </ShippingPopover>
            )
            userEvent.click(getByText(label))
            userEvent.click(getByText('Close'))

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
