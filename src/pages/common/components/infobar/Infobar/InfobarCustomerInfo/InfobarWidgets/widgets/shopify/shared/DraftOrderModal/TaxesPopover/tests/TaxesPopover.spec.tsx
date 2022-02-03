import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import {ShopifyActionType} from '../../../../types'
import TaxesPopover from '../TaxesPopover'

jest.mock('store/middlewares/segmentTracker', () => {
    const segmentTracker: Record<string, unknown> = jest.requireActual(
        'store/middlewares/segmentTracker'
    )
    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

describe('<TaxesPopover/>', () => {
    let onChange: jest.MockedFunction<
        ComponentProps<typeof TaxesPopover>['onChange']
    >

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render with checked checkbox because we charge taxes', () => {
            const taxExempt = false

            const {container} = render(
                <TaxesPopover
                    id="taxes"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    Taxes
                </TaxesPopover>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with unchecked checkbox because we do not charge taxes', () => {
            const taxExempt = true

            const {container} = render(
                <TaxesPopover
                    id="taxes"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    Taxes
                </TaxesPopover>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderTaxesPopoverOpen,
                SegmentEvent.ShopifyCreateOrderTaxesPopoverApply,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderTaxesPopoverOpen,
                SegmentEvent.ShopifyDuplicateOrderTaxesPopoverApply,
            ],
        ])(
            'should call onChange() with update value',
            (actionName, openEvent, submitEvent) => {
                const taxExempt = false
                const label = 'Taxes'

                const {getByText} = render(
                    <TaxesPopover
                        id="taxes"
                        actionName={actionName}
                        editable
                        value={taxExempt}
                        onChange={onChange}
                    >
                        {label}
                    </TaxesPopover>
                )

                userEvent.click(getByText(label))
                expect(
                    getByText(/Taxes are automatically calculated/i)
                ).toBeTruthy()
                expect(logEvent).toHaveBeenCalledWith(openEvent)

                userEvent.click(getByText(/Charge taxes/i))
                userEvent.click(getByText(/Apply/i))

                expect(onChange).toHaveBeenCalledWith(!taxExempt)
                expect(logEvent).toHaveBeenCalledWith(submitEvent)
            }
        )
    })

    describe('_onClose()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderTaxesPopoverClose,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderTaxesPopoverClose,
            ],
        ])('should track', (actionName, event) => {
            const taxExempt = false
            const label = 'Taxes'

            const {getByText} = render(
                <TaxesPopover
                    id="taxes"
                    actionName={actionName}
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    {label}
                </TaxesPopover>
            )

            userEvent.click(getByText(label))
            userEvent.click(getByText(/Close/i))

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
