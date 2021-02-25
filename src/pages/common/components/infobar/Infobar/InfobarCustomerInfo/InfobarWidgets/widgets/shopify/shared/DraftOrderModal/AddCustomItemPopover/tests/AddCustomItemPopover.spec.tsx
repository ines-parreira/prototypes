import React from 'react'
import {shallow} from 'enzyme'
import {Button, Form, Popover} from 'reactstrap'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {
    EVENTS,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker.js'
import AddCustomItemPopover from '../AddCustomItemPopover'
//$TsFixMe replace with enum once migrated
import {ShopifyAction} from '../../../../constants.js'

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker',
    () => {
        const segmentTracker: Record<string, unknown> = jest.requireActual(
            '../../../../../../../../../../../../../store/middlewares/segmentTracker.js'
        )

        return {
            ...segmentTracker,
            logEvent: jest.fn(),
        }
    }
)

describe('<AddCustomItemPopover/>', () => {
    let onSubmit: jest.MockedFunction<any>

    beforeEach(() => {
        onSubmit = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <AddCustomItemPopover
                    currencyCode="USD"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    id="add-custom-line-popover"
                    onSubmit={onSubmit}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit()', () => {
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_OPEN,
                EVENTS.SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_SAVE,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_OPEN,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_SAVE,
            ],
        ])(
            'should call prop `onSubmit` with form values',
            (actionName, openEvent, submitEvent) => {
                const component = shallow<AddCustomItemPopover>(
                    <AddCustomItemPopover
                        currencyCode="USD"
                        actionName={actionName}
                        id="add-custom-line-popover"
                        onSubmit={onSubmit}
                    />
                )

                // Open popover
                component.find(Button).at(0).simulate('click')
                expect(component.find(Popover).props().isOpen).toBe(true)
                expect(logEvent).toHaveBeenCalledWith(openEvent)

                // Change form values
                component
                    .find({id: 'title'})
                    .simulate('change', {target: {value: 'foo'}})
                component.instance()._onPriceChange('5.99')
                component
                    .find({id: 'quantity'})
                    .simulate('change', {target: {value: '2'}})
                component
                    .find({type: 'checkbox'})
                    .at(0)
                    .simulate('change', {target: {checked: true}})

                // Submit
                component
                    .find(Form)
                    .dive()
                    .find('form')
                    .simulate('submit', {preventDefault: _noop})

                expect(onSubmit).toHaveBeenCalledWith(
                    fromJS({
                        title: 'foo',
                        price: '5.99',
                        quantity: 2,
                        taxable: true,
                        requires_shipping: false,
                        product_exists: false,
                    })
                )

                expect(logEvent).toHaveBeenCalledWith(submitEvent)
            }
        )
    })

    describe('_onCancel()', () => {
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_CANCEL,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_CANCEL,
            ],
        ])('should track', (actionName, event) => {
            const component = shallow<AddCustomItemPopover>(
                <AddCustomItemPopover
                    currencyCode="USD"
                    actionName={actionName}
                    id="add-custom-line-popover"
                    onSubmit={onSubmit}
                />
            )

            component.instance()._onCancel()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
