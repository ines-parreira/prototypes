import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {
    EVENTS,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker.js'
import {shopifyDraftOrderPayloadFixture} from '../../../../../../../../../../../../../fixtures/shopify'
import {DuplicateOrderFooterComponent} from '../OrderFooter'
import {ShopifyActionType} from '../../../../types'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

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

describe('<DuplicateOrderFooterComponent/>', () => {
    const context = {integrationId: 1}
    let onPayloadChange: jest.MockedFunction<
        ComponentProps<typeof DuplicateOrderFooterComponent>['onPayloadChange']
    >

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <DuplicateOrderFooterComponent
                    editable
                    actionName={ShopifyActionType.DuplicateOrder}
                    currencyCode="USD"
                    payload={fromJS(shopifyDraftOrderPayloadFixture())}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with tags', () => {
            const payload = shopifyDraftOrderPayloadFixture()
            payload.tags = 'tag1,tag2,tag3'

            const component = shallow(
                <DuplicateOrderFooterComponent
                    editable
                    actionName={ShopifyActionType.DuplicateOrder}
                    currencyCode="USD"
                    payload={fromJS(payload)}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onNoteChange()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                EVENTS.SHOPIFY_CREATE_ORDER_NOTES_CHANGED,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_NOTES_CHANGED,
            ],
        ])(
            'should call onPayloadChange() with updated payload',
            (actionName, event) => {
                const payload = fromJS(
                    shopifyDraftOrderPayloadFixture()
                ) as Map<any, any>

                const component = shallow(
                    <DuplicateOrderFooterComponent
                        editable
                        actionName={actionName}
                        currencyCode="USD"
                        payload={payload}
                        onPayloadChange={onPayloadChange}
                    />,
                    {context}
                )

                component.find('textarea').simulate('change', {
                    target: {
                        value: 'new note',
                        style: {},
                        scrollHeight: 20,
                    },
                })

                expect(onPayloadChange).toHaveBeenCalledWith(
                    context.integrationId,
                    payload.set('note', 'new note'),
                    false
                )

                expect(logEvent).toHaveBeenCalledWith(event)
            }
        )
    })

    describe('_onTagsChange()', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                EVENTS.SHOPIFY_CREATE_ORDER_TAGS_CHANGED,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_TAGS_CHANGED,
            ],
        ])(
            'should call onPayloadChange() with updated payload',
            (actionName, event) => {
                const payload = fromJS(
                    shopifyDraftOrderPayloadFixture()
                ) as Map<any, any>

                const component = shallow<DuplicateOrderFooterComponent>(
                    <DuplicateOrderFooterComponent
                        editable
                        actionName={actionName}
                        currencyCode="USD"
                        payload={payload}
                        onPayloadChange={onPayloadChange}
                    />,
                    {context}
                )

                component.instance()._onTagsChange([
                    {label: 'new tag 1', value: 'new tag 1'},
                    {label: 'new tag 2', value: 'new tag 2'},
                ])

                expect(onPayloadChange).toHaveBeenCalledWith(
                    context.integrationId,
                    payload.set('tags', 'new tag 1,new tag 2'),
                    false
                )

                expect(logEvent).toHaveBeenCalledWith(event)
            }
        )
    })
})
