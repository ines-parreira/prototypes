import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import {Button, Form, Popover} from 'reactstrap'

import {
    SegmentEvent,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import {
    shopifyAvailableShippingRate,
    shopifyShippingLineFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import AmountInput from '../../../AmountInput/AmountInput'
import ShippingPopover from '../ShippingPopover'
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

describe('<ShippingPopover/>', () => {
    let onChange: jest.MockedFunction<
        ComponentProps<typeof ShippingPopover>['onChange']
    >

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render without value', () => {
            const component = shallow(
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

            expect(component).toMatchSnapshot()
        })

        it('should render with value', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
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

            expect(component).toMatchSnapshot()
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
            'should call onChange() with custom shipping line',
            (actionName, openEvent, submitEvent) => {
                const shippingLine = fromJS(shopifyShippingLineFixture())

                const component = shallow(
                    <ShippingPopover
                        id="shipping-lines"
                        actionName={actionName}
                        editable
                        currencyCode="USD"
                        value={shippingLine}
                        availableShippingRates={fromJS([])}
                        onChange={onChange}
                    >
                        Add shipping
                    </ShippingPopover>
                )

                // Open popover
                component.find(Button).at(0).simulate('click')
                expect(component.find(Popover).props().isOpen).toBe(true)
                expect(logEvent).toHaveBeenCalledWith(openEvent)

                // Change form values
                const handle = 'custom'
                component
                    .find({value: handle})
                    .simulate('change', {target: {value: handle}})
                component
                    .find({type: 'text'})
                    .simulate('change', {target: {value: 'Test'}})
                component
                    .find(AmountInput)
                    .dive()
                    .find({type: 'number'})
                    .simulate('change', {target: {value: '12'}})

                // Submit
                component
                    .find(Form)
                    .dive()
                    .find('form')
                    .simulate('submit', {preventDefault: _noop})

                expect(onChange).toHaveBeenCalledWith(
                    fromJS({
                        custom: true,
                        handle: null,
                        price: '12.00',
                        title: 'Test',
                    })
                )

                expect(logEvent).toHaveBeenCalledWith(submitEvent, {
                    handle,
                })
            }
        )

        it('should call onChange() with free shipping line', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
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

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component
                .find({value: 'free'})
                .simulate('change', {target: {value: 'free'}})

            // Submit
            component
                .find(Form)
                .dive()
                .find('form')
                .simulate('submit', {preventDefault: _noop})

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

            const component = shallow(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={ShopifyActionType.DuplicateOrder}
                    editable
                    currencyCode="USD"
                    value={null}
                    availableShippingRates={fromJS([availableShippingRate])}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Change form values
            component
                .find({value: availableShippingRate.get('handle')})
                .simulate('change', {
                    target: {value: availableShippingRate.get('handle')},
                })

            // Submit
            component
                .find(Form)
                .dive()
                .find('form')
                .simulate('submit', {preventDefault: _noop})

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
        ])('should call onChange() with no shipping line', () => {
            const shippingLine = fromJS(shopifyShippingLineFixture())

            const component = shallow(
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

            // Open popover
            component.find(Button).at(0).simulate('click')
            expect(component.find(Popover).props().isOpen).toBe(true)

            // Click on "Remove"
            component.find(Button).at(1).simulate('click')

            expect(component.find(Popover).props().isOpen).toBe(false)
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
        ])('should track', (actionName, event) => {
            const component = shallow<ShippingPopover>(
                <ShippingPopover
                    id="shipping-lines"
                    actionName={actionName}
                    editable
                    currencyCode="USD"
                    value={null}
                    availableShippingRates={fromJS([])}
                    onChange={onChange}
                >
                    Add shipping
                </ShippingPopover>
            )

            component.instance()._onClose()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
