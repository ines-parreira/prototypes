import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {Button, Form, Popover} from 'reactstrap'

import {
    SegmentEvent,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import TaxesPopover from '../TaxesPopover'
import {ShopifyActionType} from '../../../../types'

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker',
    () => {
        const segmentTracker: Record<string, unknown> = jest.requireActual(
            '../../../../../../../../../../../../../store/middlewares/segmentTracker'
        )
        return {
            ...segmentTracker,
            logEvent: jest.fn(),
        }
    }
)

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

            const component = shallow(
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

            expect(component).toMatchSnapshot()
        })

        it('should render with unchecked checkbox because we do not charge taxes', () => {
            const taxExempt = true

            const component = shallow(
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

            expect(component).toMatchSnapshot()
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

                const component = shallow(
                    <TaxesPopover
                        id="taxes"
                        actionName={actionName}
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
                expect(logEvent).toHaveBeenCalledWith(openEvent)

                // Change form values
                component
                    .find({type: 'checkbox'})
                    .dive()
                    .find('input')
                    .simulate('change', {target: {checked: false}})

                // Submit
                component
                    .find(Form)
                    .dive()
                    .find('form')
                    .simulate('submit', {preventDefault: _noop})

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

            const component = shallow<TaxesPopover>(
                <TaxesPopover
                    id="taxes"
                    actionName={actionName}
                    editable
                    value={taxExempt}
                    onChange={onChange}
                >
                    Taxes
                </TaxesPopover>
            )

            component.instance()._onClose()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
