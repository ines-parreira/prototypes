import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import AddCustomItemPopover from '../AddCustomItemPopover'

jest.mock('@repo/logging', () => {
    const segmentTracker: Record<string, unknown> =
        jest.requireActual('@repo/logging')

    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

jest.mock('ulidx', () => ({
    ulid: jest.fn(() => 'ulid-generated-id'),
}))

describe('<AddCustomItemPopover/>', () => {
    let onSubmit: jest.MockedFunction<any>

    beforeEach(() => {
        onSubmit = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <AddCustomItemPopover
                    currencyCode="USD"
                    actionName={ShopifyActionType.DuplicateOrder}
                    id="add-custom-line-popover"
                    onSubmit={onSubmit}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderCustomItemPopoverOpen,
                SegmentEvent.ShopifyCreateOrderCustomItemPopoverSave,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderCustomItemPopoverOpen,
                SegmentEvent.ShopifyDuplicateOrderCustomItemPopoverSave,
            ],
        ])(
            'should call prop `onSubmit` with form values',
            (actionName, openEvent, submitEvent) => {
                const { getByLabelText, getByText } = render(
                    <AddCustomItemPopover
                        currencyCode="USD"
                        actionName={actionName}
                        id="add-custom-line-popover"
                        onSubmit={onSubmit}
                    />,
                )

                userEvent.click(getByText(/Add custom item/i))
                expect(getByLabelText(/Line item name/i)).toBeTruthy()
                expect(logEvent).toHaveBeenCalledWith(openEvent)

                fireEvent.change(getByLabelText(/Line item name/i), {
                    target: { value: 'foo' },
                })
                fireEvent.change(getByLabelText(/Price per item/i), {
                    target: { value: '5.99' },
                })
                fireEvent.change(getByLabelText(/Quantity/i), {
                    target: { value: '2' },
                })
                userEvent.click(getByLabelText(/Item is taxable/i))
                userEvent.click(getByText(/Save item/i))

                expect(onSubmit).toHaveBeenCalledWith(
                    fromJS({
                        title: 'foo',
                        price: '5.99',
                        quantity: 2,
                        taxable: true,
                        requires_shipping: false,
                        product_exists: false,
                        newly_added: true,
                        localId: 'ulid-generated-id',
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
                SegmentEvent.ShopifyCreateOrderCustomItemPopoverCancel,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderCustomItemPopoverCancel,
            ],
        ])('should track', (actionName, event) => {
            const { getByText } = render(
                <AddCustomItemPopover
                    currencyCode="USD"
                    actionName={actionName}
                    id="add-custom-line-popover"
                    onSubmit={onSubmit}
                />,
            )

            userEvent.click(getByText(/Add custom item/i))
            userEvent.click(getByText(/Cancel/i))

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
