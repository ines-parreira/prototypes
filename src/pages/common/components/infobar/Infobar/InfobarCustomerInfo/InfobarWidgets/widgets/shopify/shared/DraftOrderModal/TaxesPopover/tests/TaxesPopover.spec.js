// @flow

import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {Button, Form, Popover} from 'reactstrap'

import {EVENTS, logEvent} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import TaxesPopover from '../TaxesPopover'
import {ShopifyAction} from '../../../../constants'

jest.mock('../../../../../../../../../../../../../store/middlewares/segmentTracker', () => {
    return {
        ...jest.requireActual('../../../../../../../../../../../../../store/middlewares/segmentTracker'),
        logEvent: jest.fn(),
    }
})

describe('<TaxesPopover/>', () => {
    let onChange

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render with checked checkbox because we charge taxes', () => {
            const taxExempt = false

            const component = shallow(
                <TaxesPopover
                    id="taxes"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
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
                    actionName={ShopifyAction.DUPLICATE_ORDER}
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
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_TAXES_POPOVER_OPEN,
                EVENTS.SHOPIFY_CREATE_ORDER_TAXES_POPOVER_APPLY,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_TAXES_POPOVER_OPEN,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_TAXES_POPOVER_APPLY,
            ],
        ])('should call onChange() with update value', (actionName, openEvent, submitEvent) => {
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
            component.find({type: 'checkbox'}).dive().find('input').simulate('change', {target: {checked: false}})

            // Submit
            component.find(Form).dive().find('form').simulate('submit', {preventDefault: _noop})

            expect(onChange).toHaveBeenCalledWith(!taxExempt)
            expect(logEvent).toHaveBeenCalledWith(submitEvent)
        })
    })

    describe('_onClose()', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_TAXES_POPOVER_CLOSE],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_TAXES_POPOVER_CLOSE],
        ])('should track', (actionName, event) => {
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

            component.instance()._onClose()

            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
